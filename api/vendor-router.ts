import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { leads, reviews, savedProducts, vendorClaims } from "@db/schema";
import { getDb } from "./queries/connection";
import { authedQuery, createRouter } from "./middleware";

async function assertVendorOwnsProvider(userId: number, providerSlug: string | null) {
  if (!providerSlug) throw new TRPCError({ code: "FORBIDDEN", message: "This record is not attached to a provider." });
  const [claim] = await getDb().select({ id: vendorClaims.id }).from(vendorClaims).where(and(
    eq(vendorClaims.userId, userId),
    eq(vendorClaims.providerSlug, providerSlug),
    eq(vendorClaims.status, "approved"),
  )).limit(1);
  if (!claim) throw new TRPCError({ code: "FORBIDDEN", message: "You do not manage this provider profile." });
}

export const vendorRouter = createRouter({
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [claims, saved] = await Promise.all([
      db.select().from(vendorClaims).where(eq(vendorClaims.userId, ctx.user.id)).orderBy(desc(vendorClaims.createdAt)),
      db.select().from(savedProducts).where(eq(savedProducts.userId, ctx.user.id)).orderBy(desc(savedProducts.createdAt)),
    ]);
    const slugs = claims.filter((claim) => claim.status === "approved").map((claim) => claim.providerSlug);
    const [vendorLeads, vendorReviews] = slugs.length ? await Promise.all([
      db.select().from(leads).where(inArray(leads.providerSlug, slugs)).orderBy(desc(leads.createdAt)).limit(200),
      db.select().from(reviews).where(inArray(reviews.providerSlug, slugs)).orderBy(desc(reviews.createdAt)).limit(200),
    ]) : [[], []];
    return { claims, saved, leads: vendorLeads, reviews: vendorReviews };
  }),

  claim: authedQuery.input(z.object({
    providerSlug: z.string().trim().min(1).max(120),
    businessEmail: z.string().trim().email().max(320),
    website: z.string().trim().max(300).optional(),
    note: z.string().trim().max(1500).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [existing] = await db.select().from(vendorClaims).where(and(
      eq(vendorClaims.userId, ctx.user.id),
      eq(vendorClaims.providerSlug, input.providerSlug),
      inArray(vendorClaims.status, ["pending", "approved"]),
    )).limit(1);
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "You already have an active claim for this profile." });
    const [{ id }] = await db.insert(vendorClaims).values({
      providerSlug: input.providerSlug,
      userId: ctx.user.id,
      businessEmail: input.businessEmail,
      website: input.website || null,
      note: input.note || null,
    }).$returningId();
    return { ok: true, id };
  }),

  saveProduct: authedQuery.input(z.object({ providerSlug: z.string().min(1).max(120), saved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (input.saved) {
        await db.insert(savedProducts).values({ userId: ctx.user.id, providerSlug: input.providerSlug })
          .onDuplicateKeyUpdate({ set: { providerSlug: input.providerSlug } });
      } else {
        await db.delete(savedProducts).where(and(eq(savedProducts.userId, ctx.user.id), eq(savedProducts.providerSlug, input.providerSlug)));
      }
      return { ok: true, saved: input.saved };
    }),

  updateLead: authedQuery.input(z.object({
    id: z.number().int().positive(),
    status: z.enum(["new", "sent", "contacted", "won", "lost"]),
    internalNotes: z.string().max(2000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [lead] = await db.select().from(leads).where(eq(leads.id, input.id)).limit(1);
    if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
    await assertVendorOwnsProvider(ctx.user.id, lead.providerSlug);
    await db.update(leads).set({ status: input.status, internalNotes: input.internalNotes ?? lead.internalNotes }).where(eq(leads.id, input.id));
    return { ok: true };
  }),

  replyToReview: authedQuery.input(z.object({ id: z.number().int().positive(), response: z.string().trim().min(3).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [review] = await db.select().from(reviews).where(eq(reviews.id, input.id)).limit(1);
      if (!review || review.status !== "approved") throw new TRPCError({ code: "NOT_FOUND", message: "Published review not found." });
      await assertVendorOwnsProvider(ctx.user.id, review.providerSlug);
      await db.update(reviews).set({ vendorResponse: input.response, respondedAt: new Date() }).where(eq(reviews.id, input.id));
      return { ok: true };
    }),
});
