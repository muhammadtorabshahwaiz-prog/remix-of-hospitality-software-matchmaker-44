import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { leads, reviews, siteEvents, sponsoredSlots, subscriptions, users, vendorClaims } from "@db/schema";
import { getDb } from "./queries/connection";
import { adminQuery, createRouter } from "./middleware";

export const adminRouter = createRouter({
  workspace: adminQuery.query(async () => {
    const db = getDb();
    const [reviewRows, leadRows, claimRows, slotRows] = await Promise.all([
      db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(250),
      db.select().from(leads).orderBy(desc(leads.createdAt)).limit(250),
      db.select().from(vendorClaims).orderBy(desc(vendorClaims.createdAt)).limit(250),
      db.select().from(sponsoredSlots).orderBy(desc(sponsoredSlots.createdAt)).limit(250),
    ]);
    return { reviews: reviewRows, leads: leadRows, claims: claimRows, slots: slotRows };
  }),

  moderateReview: adminQuery.input(z.object({
    id: z.number().int().positive(),
    status: z.enum(["pending", "approved", "rejected"]),
    verified: z.boolean(),
  })).mutation(async ({ input }) => {
    await getDb().update(reviews).set({ status: input.status, verifiedAt: input.verified ? new Date() : null }).where(eq(reviews.id, input.id));
    return { ok: true };
  }),

  updateLead: adminQuery.input(z.object({
    id: z.number().int().positive(),
    status: z.enum(["new", "sent", "contacted", "won", "lost"]),
    internalNotes: z.string().max(2000).optional(),
  })).mutation(async ({ input }) => {
    await getDb().update(leads).set({ status: input.status, internalNotes: input.internalNotes }).where(eq(leads.id, input.id));
    return { ok: true };
  }),

  moderateClaim: adminQuery.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "approved", "rejected"]) }))
    .mutation(async ({ input }) => {
      await getDb().update(vendorClaims).set({ status: input.status }).where(eq(vendorClaims.id, input.id));
      return { ok: true };
    }),

  createSponsoredSlot: adminQuery.input(z.object({
    categorySlug: z.string().trim().min(1).max(120),
    providerSlug: z.string().trim().min(1).max(120),
    position: z.number().int().min(1).max(3),
    priceCents: z.number().int().min(0).max(100000000),
  })).mutation(async ({ input }) => {
    const [{ id }] = await getDb().insert(sponsoredSlots).values(input).$returningId();
    return { ok: true, id };
  }),

  setSponsoredSlotActive: adminQuery.input(z.object({ id: z.number().int().positive(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const result = await getDb().update(sponsoredSlots).set({ active: input.active }).where(eq(sponsoredSlots.id, input.id));
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Sponsored slot not found." });
      return { ok: true };
    }),

  /** Headline numbers for the admin overview: what needs attention now, and 30 days of traffic events. */
  stats: adminQuery.query(async () => {
    const db = getDb();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const one = async (q: PromiseLike<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);
    const [pendingReviews, newLeads, pendingClaims, userCount, activeSubs, events, topPages] = await Promise.all([
      one(db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending"))),
      one(db.select({ n: count() }).from(leads).where(eq(leads.status, "new"))),
      one(db.select({ n: count() }).from(vendorClaims).where(eq(vendorClaims.status, "pending"))),
      one(db.select({ n: count() }).from(users)),
      one(db.select({ n: count() }).from(subscriptions).where(eq(subscriptions.status, "active"))),
      db.select({ kind: siteEvents.kind, n: count() }).from(siteEvents).where(gte(siteEvents.createdAt, since)).groupBy(siteEvents.kind),
      db.select({ slug: siteEvents.slug, kind: siteEvents.kind, n: count() }).from(siteEvents)
        .where(and(gte(siteEvents.createdAt, since), sql`${siteEvents.slug} IS NOT NULL`)).groupBy(siteEvents.slug, siteEvents.kind).orderBy(desc(count())).limit(15),
    ]);
    return { pendingReviews, newLeads, pendingClaims, userCount, activeSubs, events, topPages };
  }),

  users: adminQuery.query(async () => {
    return getDb().select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignInAt: users.lastSignInAt })
      .from(users).orderBy(desc(users.createdAt)).limit(500);
  }),

  setUserRole: adminQuery.input(z.object({ id: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id && input.role !== "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own admin access." });
      await getDb().update(users).set({ role: input.role }).where(eq(users.id, input.id));
      return { ok: true };
    }),

  deleteReview: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(reviews).where(eq(reviews.id, input.id));
    return { ok: true };
  }),

  updateSponsoredSlot: adminQuery.input(z.object({
    id: z.number().int().positive(),
    position: z.number().int().min(1).max(3).optional(),
    priceCents: z.number().int().min(0).max(100000000).optional(),
    endsAt: z.date().nullable().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...patch } = input;
    if (Object.keys(patch).length) await getDb().update(sponsoredSlots).set(patch).where(eq(sponsoredSlots.id, id));
    return { ok: true };
  }),

  /** All leads as CSV text, ready to download from the admin page. */
  exportLeads: adminQuery.query(async () => {
    const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt)).limit(5000);
    const head = ["id", "created", "type", "status", "name", "email", "company", "phone", "city", "provider", "interest", "notes", "consent", "utm_source", "utm_medium", "utm_campaign"];
    // Quote every field and neutralise spreadsheet formulas (=, +, -, @) so an exported lead cannot run code in Excel.
    const cell = (v: unknown) => { let t = v == null ? "" : String(v).replace(/\r?\n/g, " "); if (/^[=+\-@]/.test(t)) t = `'${t}`; return `"${t.replace(/"/g, '""')}"`; };
    const lines = rows.map((r) => [r.id, r.createdAt.toISOString(), r.type, r.status, r.name, r.email, r.company, r.phone, r.city, r.providerSlug, r.interest, r.notes, r.consent ? "yes" : "no", r.utmSource, r.utmMedium, r.utmCampaign].map(cell).join(","));
    return { csv: [head.join(","), ...lines].join("\n"), count: rows.length };
  }),
});
