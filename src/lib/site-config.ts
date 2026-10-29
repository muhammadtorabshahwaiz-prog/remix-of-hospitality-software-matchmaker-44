/**
 * Canonical public URL of the site. CHANGE THIS to the real production domain before launch.
 * It feeds canonical tags, JSON-LD, public/sitemap.xml and the embeddable badge snippet.
 */
export const SITE_URL = "https://hospitalityservis.com";
export const SITE_NAME = "Hospitalityservis";
export const absUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
