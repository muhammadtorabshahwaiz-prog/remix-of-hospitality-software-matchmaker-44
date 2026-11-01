import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { subscriptions, vendorClaims } from "@db/schema";
import { authedQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import { stripe, stripeEnabled } from "./lib/stripe";

const PLAN_IDS = ["pro"] as const;
const originOf = (req: Request) => env.publicUrl || new URL(req.url).origin;

export const billingRouter = createRouter({
  status: publicQuery.query(() => ({
    enabled: stripeEnabled() && !!env.stripePrices.pro,
    yearly: !!env.stripePrices.proYearly,
    // which extra pay-by links are configured (the URLs are public by design)
    links: Object.fromEntries(Object.entries(env.payLinks).filter(([, v]) => !!v)) as Record<string, string>,
  })),

  mine: authedQuery.query(async ({ ctx }) =>
    getDb().select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).orderBy(desc(subscriptions.createdAt)),
  ),

  checkout: authedQuery
    .input(z.object({ plan: z.enum(PLAN_IDS), interval: z.enum(["monthly", "yearly"]).default("monthly"), providerSlug: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      const priceId = input.interval === "yearly" ? env.stripePrices.proYearly : env.stripePrices.pro;
      if (!stripeEnabled() || !priceId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Payments are not set up on this site yet." });
      }
      // Only a manager of an approved profile can pay for that profile.
      const [claim] = await getDb().select({ id: vendorClaims.id }).from(vendorClaims).where(and(
        eq(vendorClaims.userId, ctx.user.id), eq(vendorClaims.providerSlug, input.providerSlug), eq(vendorClaims.status, "approved"),
      )).limit(1);
      if (!claim) throw new TRPCError({ code: "FORBIDDEN", message: "Claim and verify this profile before choosing a plan." });
      const [prior] = await getDb().select({ c: subscriptions.stripeCustomerId }).from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
      const origin = originOf(ctx.req);
      const meta = { providerSlug: input.providerSlug, plan: input.plan, userId: String(ctx.user.id) };
      const session = await stripe<{ url: string }>("POST", "/checkout/sessions", {
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/vendor?tab=billing&paid=1`,
        cancel_url: `${origin}/pricing`,
        client_reference_id: String(ctx.user.id),
        ...(prior ? { customer: prior.c } : ctx.user.email ? { customer_email: ctx.user.email } : {}),
        metadata: meta,
        subscription_data: { metadata: meta },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        locale: "auto",
        // Unset = dynamic payment methods: Checkout shows every method enabled in the Stripe Dashboard that fits the buyer's country and currency.
        ...(env.stripePaymentMethods.length ? { payment_method_types: env.stripePaymentMethods } : {}),
      });
      return { url: session.url };
    }),

  portal: authedQuery.mutation(async ({ ctx }) => {
    if (!stripeEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Payments are not set up on this site yet." });
    const [sub] = await getDb().select({ c: subscriptions.stripeCustomerId }).from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
    if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "You do not have a subscription yet." });
    const session = await stripe<{ url: string }>("POST", "/billing_portal/sessions", { customer: sub.c, return_url: `${originOf(ctx.req)}/vendor?tab=billing` });
    return { url: session.url };
  }),
});
