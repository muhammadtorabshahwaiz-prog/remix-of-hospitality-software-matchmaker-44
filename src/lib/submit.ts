import { z } from "zod";

/**
 * Form submission layer.
 *
 * BACKEND_ENABLED is false until a real backend (Lovable Cloud / Supabase) is connected.
 * While false, submissions are validated and kept ONLY in this browser (localStorage "hs-outbox"),
 * and the UI says so ("Preview mode"). Nothing is sent to the Hospitalityservis team.
 *
 * To go live: implement the `live` branch of `send()` (insert into the `reviews` / `leads` tables
 * through a server function), then set BACKEND_ENABLED = true. Forms and validation stay unchanged.
 * Real rate limiting and spam checks must also run on the server; the client checks below are a courtesy.
 */
export const BACKEND_ENABLED = false;

const opt = (n: number) => z.string().trim().max(n).optional().or(z.literal(""));
const rate = z.number().int().min(0).max(5);

export const reviewSchema = z.object({
  provider: z.string().min(1, "Choose a provider"),
  rating: z.number().int().min(1, "Choose an overall rating").max(5),
  ease: rate, value: rate, support: rate, features: rate,
  title: z.string().trim().min(3, "Add a short review title").max(120),
  body: z.string().trim().min(20, "Tell us a bit more (at least 20 characters)").max(4000),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  business: opt(120),
  city: opt(120),
  incentivized: z.boolean(),
  relationship: opt(500),
  genuine: z.literal(true, { errorMap: () => ({ message: "Please confirm this review reflects your genuine experience" }) }),
  company_url: z.string().optional(),
});

export const leadSchema = z.object({
  type: z.enum(["demo", "operator_join", "vendor_join", "vendor_listing", "contact"]),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  restaurant: opt(120),
  phone: opt(40),
  city: opt(120),
  interest: opt(200),
  notes: opt(2000),
  product: opt(120),
  company: opt(120),
  website: opt(200),
  category: opt(120),
  plan: opt(60),
  consent: z.boolean(),
  consent_text: opt(400),
  company_url: z.string().optional(),
}).superRefine((v, ctx) => {
  if ((v.type === "demo" || v.type === "operator_join") && !v.consent) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["consent"], message: "Please tick the consent box so we know we may contact you" });
  }
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type SubmitResult = { ok: true; mode: "preview" | "live" } | { ok: false; message: string; errors: Record<string, string> };

/* ---------- attribution (UTM, partner, referrer) ---------- */
const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "partner"];

export function captureAttribution(extra: Record<string, string> = {}) {
  try {
    const q = new URLSearchParams(location.search);
    const prev = JSON.parse(sessionStorage.getItem("hs-attr") || "{}") as Record<string, string>;
    const found: Record<string, string> = {};
    ATTR_KEYS.forEach((k) => { const v = q.get(k); if (v) found[k] = v.slice(0, 100); });
    const merged: Record<string, string> = { ...prev, ...found, ...extra };
    if (!merged["referrer"] && document.referrer) merged["referrer"] = document.referrer.slice(0, 300);
    if (!merged["landing_path"]) merged["landing_path"] = location.pathname;
    sessionStorage.setItem("hs-attr", JSON.stringify(merged));
  } catch { /* storage unavailable */ }
}

export function getAttribution(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem("hs-attr") || "{}") as Record<string, string>; } catch { return {}; }
}

/* ---------- internals ---------- */
function rateLimited(kind: string) {
  try {
    const key = `hs-rl-${kind}`; const now = Date.now();
    const hits = (JSON.parse(localStorage.getItem(key) || "[]") as number[]).filter((t) => now - t < 3_600_000);
    if (hits.length >= 5) return true;
    hits.push(now); localStorage.setItem(key, JSON.stringify(hits));
    return false;
  } catch { return false; }
}

async function send(kind: "review" | "lead", payload: Record<string, unknown>): Promise<"preview" | "live"> {
  if (!BACKEND_ENABLED) {
    try {
      const box = JSON.parse(localStorage.getItem("hs-outbox") || "[]") as unknown[];
      box.push({ kind, payload, at: new Date().toISOString() });
      localStorage.setItem("hs-outbox", JSON.stringify(box.slice(-50)));
    } catch { /* ignore */ }
    return "preview";
  }
  // LIVE BRANCH: call a server function that inserts into Supabase (reviews.status = 'pending'; leads with consent fields).
  throw new Error("BACKEND_ENABLED is true but no live handler is implemented in src/lib/submit.ts");
}

async function run(kind: "review" | "lead", schema: z.ZodTypeAny, input: Record<string, unknown>): Promise<SubmitResult> {
  if (input["company_url"]) return { ok: true, mode: "preview" }; // honeypot filled: pretend success, store nothing
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) { const k = String(i.path[0] ?? "form"); if (!errors[k]) errors[k] = i.message; }
    return { ok: false, errors, message: Object.values(errors)[0] ?? "Please check the form and try again." };
  }
  if (rateLimited(kind)) return { ok: false, errors: {}, message: "Too many submissions from this device. Please try again in an hour." };
  try {
    const mode = await send(kind, { ...(parsed.data as Record<string, unknown>), attribution: getAttribution() });
    return { ok: true, mode };
  } catch {
    return { ok: false, errors: {}, message: "Something went wrong. Please try again." };
  }
}

export const submitReview = (input: Record<string, unknown>) => run("review", reviewSchema, input);
export const submitLead = (input: Record<string, unknown>) => run("lead", leadSchema, input);
