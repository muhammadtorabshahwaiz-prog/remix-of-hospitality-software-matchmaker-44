import type { Hono } from "hono";
import { sql } from "drizzle-orm";
import { BEST, CATEGORIES, PROVIDERS } from "../../src/data/site";
import { PARTNERS } from "../../src/data/partners";
import { env } from "./env";
import { getDb } from "../queries/connection";

const STATIC = ["/", "/categories", "/reviews", "/compare", "/write-review", "/financing", "/for-vendors", "/pricing", "/about", "/methodology", "/disclosure", "/privacy", "/terms", "/accessibility", "/contact"];

function origin(c: { req: { url: string } }) {
  return env.publicUrl || new URL(c.req.url).origin;
}

/** /api/health, /robots.txt and /sitemap.xml. Registered before the static-file catch-all. */
export function registerSeoRoutes(app: Hono<any>) {
  app.get("/api/health", async (c) => {
    try {
      await getDb().execute(sql`select 1`);
      return c.json({ ok: true, db: true, ts: Date.now() });
    } catch {
      return c.json({ ok: false, db: false, ts: Date.now() }, 503);
    }
  });

  app.get("/robots.txt", (c) => {
    const base = origin(c);
    const body = ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /vendor", "Disallow: /account", "Disallow: /embed/", "Disallow: /go/", "Disallow: /api/", "", `Sitemap: ${base}/sitemap.xml`, ""].join("\n");
    return c.text(body, 200, { "cache-control": "public, max-age=3600" });
  });

  app.get("/sitemap.xml", (c) => {
    const base = origin(c);
    const urls = [
      ...STATIC,
      ...CATEGORIES.map((x) => `/categories/${x.slug}`),
      ...PROVIDERS.map((x) => `/software/${x.slug}`),
      ...BEST.map((x) => `/best/${x.slug}`),
    ];
    // /go/ partner pages are tracking landing pages, so they stay out of the sitemap (and are disallowed in robots.txt).
    void PARTNERS;
    const today = new Date().toISOString().slice(0, 10);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`;
    return c.body(xml, 200, { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" });
  });
}
