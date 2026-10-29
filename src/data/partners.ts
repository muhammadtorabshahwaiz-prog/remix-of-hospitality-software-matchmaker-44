// SAMPLE partner landing pages. Each one is a template for /go/:slug.
// Replace copy and review snippets with approved, real content once a partnership is signed.
export type Partner = {
  slug: string;        // /go/:slug
  provider: string;    // provider slug in data/site.ts
  headline: string;
  sub: string;
  benefits: string[];
  cta: string;
};

export const PARTNERS: Partner[] = [
  { slug: "never-miss-an-order", provider: "slang-ai", headline: "Stop losing orders to missed calls", sub: "AI phone answering that picks up during the Friday rush so your staff can stay with guests.", benefits: ["Answers every call, including during rush hour", "Handles hours, menu and reservation questions", "See how operators rate it before you talk to anyone"], cta: "Request a demo" },
  { slug: "compare-pos", provider: "spoton", headline: "Find a POS that fits how you actually run", sub: "Compare fees, hardware and support from operators, then ask for a quote only if it fits.", benefits: ["Side-by-side comparison with other POS systems", "Plain-language pricing questions to ask", "No obligation to switch"], cta: "Get a quote" },
  { slug: "lower-card-fees", provider: "helcim", headline: "Check what you really pay in card fees", sub: "Get a second opinion on your effective rate and see how other operators compare.", benefits: ["Understand effective rate versus quoted rate", "Contract terms explained up front", "Introductions only with your consent"], cta: "Request a quote" },
  { slug: "restaurant-funding", provider: "inkind", headline: "Funding options, explained before you sign", sub: "Learn how food-credit and other funding programs work, then decide if it is right for your venue.", benefits: ["Clear overview of funding types and trade-offs", "Eligibility guide, not a credit decision", "We are not a lender; terms vary by provider"], cta: "Ask about funding" },
];
export const getPartner = (slug: string) => PARTNERS.find((p) => p.slug === slug);
