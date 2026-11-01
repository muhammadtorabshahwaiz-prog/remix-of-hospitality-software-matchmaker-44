import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { siteEvents } from "@db/schema";
import { getDb } from "./queries/connection";
import { createRouter, publicQuery } from "./middleware";

const KINDS = ["partner_view", "outbound_click", "compare_start", "search", "cta_click"] as const;
const opt = (n: number) => z.string().trim().max(n).optional();

const hits = new Map<string, number[]>();
function limited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 200) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

/** Cookie-free first-party counters. Nothing personal is stored: no IP, no user agent, no email. */
export const analyticsRouter = createRouter({
  track: publicQuery.input(z.object({
    kind: z.enum(KINDS),
    path: z.string().trim().min(1).max(300),
    slug: opt(120),
    source: opt(160),
    utmSource: opt(120),
    utmMedium: opt(120),
    utmCampaign: opt(120),
  })).mutation(async ({ ctx, input }) => {
    if (limited(ctx.req)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down." });
    await getDb().insert(siteEvents).values({
      kind: input.kind,
      path: input.path,
      slug: input.slug || null,
      source: input.source || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
    });
    return { ok: true };
  }),
});
