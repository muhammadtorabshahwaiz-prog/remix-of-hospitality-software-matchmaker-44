import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export const stripeEnabled = () => !!env.stripeSecretKey;

function flatten(obj: Record<string, unknown>, prefix = "", out: [string, string][] = []): [string, string][] {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === "object" ? flatten(item as Record<string, unknown>, `${key}[${i}]`, out) : out.push([`${key}[${i}]`, String(item)])));
    else if (typeof v === "object") flatten(v as Record<string, unknown>, key, out);
    else out.push([key, String(v)]);
  }
  return out;
}

/** Minimal Stripe REST client (no SDK needed). */
export async function stripe<T = any>(method: "GET" | "POST", path: string, params: Record<string, unknown> = {}): Promise<T> {
  const body = new URLSearchParams(flatten(params));
  const resp = await fetch(`https://api.stripe.com/v1${path}${method === "GET" && body.size ? `?${body}` : ""}`, {
    method,
    headers: { authorization: `Bearer ${env.stripeSecretKey}`, ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
    body: method === "POST" ? body : undefined,
  });
  const json = (await resp.json()) as any;
  if (!resp.ok) throw new Error(json?.error?.message || `Stripe error ${resp.status}`);
  return json as T;
}

/** Checks the Stripe-Signature header (HMAC-SHA256 of "timestamp.payload") and rejects stale events. */
export function verifyStripeSignature(payload: string, header: string | undefined, secret: string, toleranceSec = 300): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const given = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return given.some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}
