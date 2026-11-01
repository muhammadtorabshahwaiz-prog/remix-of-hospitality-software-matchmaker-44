import { sendMail, escapeHtml } from "./lib/mailer";
import { env } from "./lib/env";
import { and, desc, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { leads, reviewVotes, reviews, sponsoredSlots } from "@db/schema";
import { summarize } from "./lib/rating";
import { getDb } from "./queries/connection";
import { authedQuery, createRouter, publicQuery } from "./middleware";

const optional = (max: number) => z.string().trim().max(max).optional();
const attribution = z.object({
  source: optional(160),
  utmSource: optional(120),
  utmMedium: optional(120),
  utmCampaign: optional(120),
}).optional();

const reviewInput = z.object({
  providerSlug: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  ease: z.number().int().min(0).max(5),
  value: z.number().int().min(0).max(5),
  support: z.number().int().min(0).max(5),
  features: z.number().int().min(0).max(5),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(20).max(4000),
  pros: optional(1500),
  cons: optional(1500),
  reviewerName: z.string().trim().min(2).max(100),
  reviewerEmail: z.string().trim().email().max(320),
  reviewerRole: optional(120),
  business: optional(160),
  city: optional(120),
  incentivized: z.boolean(),
  relationship: optional(1000),
  genuine: z.literal(true),
  companyUrl: z.string().optional(),
});

const leadInput = z.object({
  type: z.enum(["demo", "operator_join", "vendor_join", "vendor_listing", "contact", "newsletter"]),
  providerSlug: optional(120),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  company: optional(160),
  phone: optional(40),
  city: optional(120),
  interest: optional(200),
  notes: optional(2000),
  consent: z.literal(true),
  consentText: optional(500),
  attribution,
  companyUrl: z.string().optional(),
});

const attempts = new Map<string, number[]>();
function checkRate(req: Request, kind: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${kind}:${ip}`;
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 6) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many submissions. Please try again in an hour." });
  }
  recent.push(now);
  attempts.set(key, recent);
}

export const marketplaceRouter = createRouter({
  approvedReviews: publicQuery
    .input(z.object({ providerSlug: z.string().max(120).optional(), limit: z.number().int().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const where = input.providerSlug
        ? and(eq(reviews.providerSlug, input.providerSlug), eq(reviews.status, "approved"))
        : eq(reviews.status, "approved");
      return getDb().select().from(reviews).where(where).orderBy(desc(reviews.createdAt)).limit(input.limit);
    }),

  ratingSummary: publicQuery
    .input(z.object({ providerSlug: z.string().min(1).max(120) }))
    .query(async ({ input }) => {
      const rows = await getDb().select().from(reviews).where(and(eq(reviews.providerSlug, input.providerSlug), eq(reviews.status, "approved")));
      return summarize(rows);
    }),

  voteHelpful: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [review] = await db.select().from(reviews).where(and(eq(reviews.id, input.id), eq(reviews.status, "approved"))).limit(1);
      if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Review not found." });
      if (review.userId === ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot vote on your own review." });
      const [existing] = await db.select().from(reviewVotes).where(and(eq(reviewVotes.reviewId, input.id), eq(reviewVotes.userId, ctx.user.id))).limit(1);
      if (existing) {
        await db.delete(reviewVotes).where(eq(reviewVotes.id, existing.id));
        await db.update(reviews).set({ helpfulCount: sql`GREATEST(${reviews.helpfulCount} - 1, 0)` }).where(eq(reviews.id, input.id));
      } else {
        await db.insert(reviewVotes).values({ reviewId: input.id, userId: ctx.user.id });
        await db.update(reviews).set({ helpfulCount: sql`${reviews.helpfulCount} + 1` }).where(eq(reviews.id, input.id));
      }
      return { voted: !existing, helpfulCount: Math.max(0, review.helpfulCount + (existing ? -1 : 1)) };
    }),

  activeSponsoredSlots: publicQuery
    .input(z.object({ categorySlug: z.string().min(1).max(120) }))
    .query(async ({ input }) => {
      const now = new Date();
      return getDb().select().from(sponsoredSlots).where(and(
        eq(sponsoredSlots.categorySlug, input.categorySlug),
        eq(sponsoredSlots.active, true),
        lte(sponsoredSlots.startsAt, now),
        or(isNull(sponsoredSlots.endsAt), gt(sponsoredSlots.endsAt, now)),
      )).orderBy(sponsoredSlots.position);
    }),

  submitReview: publicQuery.input(reviewInput).mutation(async ({ ctx, input }) => {
    if (input.companyUrl) return { ok: true, id: 0 };
    checkRate(ctx.req, "review");
    const [{ id }] = await getDb().insert(reviews).values({
      providerSlug: input.providerSlug,
      userId: ctx.user?.id,
      reviewerName: input.reviewerName,
      reviewerEmail: input.reviewerEmail,
      reviewerRole: input.reviewerRole || null,
      business: input.business || null,
      city: input.city || null,
      rating: input.rating,
      ease: input.ease,
      value: input.value,
      support: input.support,
      features: input.features,
      title: input.title,
      body: input.body,
      pros: input.pros || null,
      cons: input.cons || null,
      incentivized: input.incentivized,
      relationship: input.relationship || null,
      status: "pending",
    }).$returningId();
    return { ok: true, id };
  }),

  submitLead: publicQuery.input(leadInput).mutation(async ({ ctx, input }) => {
    if (input.companyUrl) return { ok: true, id: 0 };
    checkRate(ctx.req, "lead");
    const [{ id }] = await getDb().insert(leads).values({
      type: input.type,
      providerSlug: input.providerSlug || null,
      name: input.name,
      email: input.email,
      company: input.company || null,
      phone: input.phone || null,
      city: input.city || null,
      interest: input.interest || null,
      notes: input.notes || null,
      consent: input.consent,
      consentText: input.consentText || null,
      source: input.attribution?.source || null,
      utmSource: input.attribution?.utmSource || null,
      utmMedium: input.attribution?.utmMedium || null,
      utmCampaign: input.attribution?.utmCampaign || null,
    }).$returningId();
    const safe = (v?: string | null) => escapeHtml(v || "-");
    const summary = `Type: ${input.type}\nName: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company || "-"}\nPhone: ${input.phone || "-"}\nInterest: ${input.interest || "-"}\nNotes: ${input.notes || "-"}`;
    if (env.contactInbox) {
      void sendMail({ to: env.contactInbox, replyTo: input.email, subject: `New ${input.type} enquiry from ${input.name}`, text: summary, html: `<pre style="font-family:inherit">${safe(summary)}</pre>` });
    }
    void sendMail({ to: input.email, subject: "We received your message", text: `Hi ${input.name},\n\nThanks for getting in touch. We have your message and will reply soon.\n\nHospitalityservis` });
    return { ok: true, id };
  }),
});
