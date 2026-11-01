import type { Hono } from "hono";
import { eq } from "drizzle-orm";
import { subscriptions } from "@db/schema";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import { stripe, verifyStripeSignature } from "./lib/stripe";

type Sub = { id: string; customer: string; status: string; current_period_end?: number; items?: { data?: { current_period_end?: number }[] }; metadata?: Record<string, string> };

async function saveSubscription(sub: Sub) {
  const db = getDb();
  const end = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  const set = { status: sub.status, currentPeriodEnd: end ? new Date(end * 1000) : null };
  const [existing] = await db.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, sub.id)).limit(1);
  if (existing) { await db.update(subscriptions).set(set).where(eq(subscriptions.id, existing.id)); return; }
  const m = sub.metadata ?? {};
  if (!m.userId || !m.providerSlug || !m.plan) return; // not one of ours
  await db.insert(subscriptions).values({ userId: Number(m.userId), providerSlug: m.providerSlug, plan: m.plan, stripeCustomerId: sub.customer, stripeSubscriptionId: sub.id, ...set });
}

/** POST /api/stripe/webhook: Stripe tells us when a payment succeeds, a plan changes or a subscription ends. */
export function registerStripeWebhook(app: Hono<any>) {
  app.post("/api/stripe/webhook", async (c) => {
    const raw = await c.req.text();
    if (!verifyStripeSignature(raw, c.req.header("stripe-signature"), env.stripeWebhookSecret)) return c.json({ error: "bad signature" }, 400);
    try {
      const event = JSON.parse(raw) as { type: string; data: { object: any } };
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const s = event.data.object;
        if (s.mode === "subscription" && s.subscription) await saveSubscription(await stripe<Sub>("GET", `/subscriptions/${s.subscription}`));
      } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
        await saveSubscription(event.data.object as Sub);
      }
      return c.json({ received: true });
    } catch (e) {
      console.warn("[stripe] webhook handling failed:", e);
      return c.json({ error: "handler failed" }, 500); // Stripe will retry
    }
  });
}
