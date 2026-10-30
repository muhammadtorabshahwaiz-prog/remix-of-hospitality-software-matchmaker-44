import { absUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { Provider, Review } from "@/data/site";

/** Build a JSON-LD script entry for a route's head(). "<" is escaped so content can never close the tag. */
export const jsonLd = (data: unknown) => ({ type: "application/ld+json", children: JSON.stringify(data).replace(/</g, "\\u003c") });
export const canonical = (path: string) => ({ rel: "canonical", href: absUrl(path) });

export const organizationLd = () => ({
  "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL,
  description: "Software reviews, comparisons and qualified introductions across every category.",
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
});

export const faqLd = (faqs: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

/**
 * SoftwareApplication markup. Rating and review markup is ONLY emitted for real, non-sample data:
 * publishing invented ratings in structured data violates search-engine guidelines and consumer-protection rules.
 */
export function softwareLd(p: Provider, reviews: Review[]) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.name, description: p.tagline,
    applicationCategory: "BusinessApplication", url: absUrl(`/software/${p.slug}`),
  };
  const isSample = (p as { sample: boolean }).sample !== false;
  if (!isSample && reviews.length > 0) {
    base["aggregateRating"] = { "@type": "AggregateRating", ratingValue: p.score, reviewCount: p.reviews, bestRating: 5, worstRating: 1 };
    base["review"] = reviews.slice(0, 5).map((r) => ({
      "@type": "Review", author: { "@type": "Person", name: r.author }, datePublished: r.date, name: r.title, reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    }));
  }
  return base;
}
