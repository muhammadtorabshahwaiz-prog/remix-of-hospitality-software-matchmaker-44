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
  { slug: "find-your-crm", provider: "hubspot-crm", headline: "Find a CRM your team will actually use", sub: "Compare the leading CRMs on ease of use, automation and total cost before you talk to a salesperson.", benefits: ["Side-by-side comparison of top CRM products", "Pricing questions to ask before you sign", "No obligation, and your details are shared only with consent"], cta: "Request a demo" },
  { slug: "project-management-guide", provider: "asana", headline: "Pick project software your whole team will adopt", sub: "See how teams rate the leading tools on ease, value and support, then request a demo only if it fits.", benefits: ["Real user ratings across ease, value and support", "Compare views, automation and reporting", "Free for buyers, with no obligation"], cta: "Get a quote" },
  { slug: "never-miss-an-order", provider: "slang-ai", headline: "Stop losing customers to missed calls", sub: "AI voice agents that answer every call so your team can stay focused on customers.", benefits: ["Answers every call, including at peak times", "Handles common questions and bookings", "See how users rate it before you talk to anyone"], cta: "Request a demo" },
  { slug: "compare-pos", provider: "spoton", headline: "Find a POS that fits how you actually run", sub: "Compare fees, hardware and support from real users, then ask for a quote only if it fits.", benefits: ["Side-by-side comparison with other POS systems", "Plain-language pricing questions to ask", "No obligation to switch"], cta: "Get a quote" },
  { slug: "lower-card-fees", provider: "helcim", headline: "Check what you really pay in card fees", sub: "Get a second opinion on your effective rate and see how other users compare.", benefits: ["Understand effective rate versus quoted rate", "Contract terms explained up front", "Introductions only with your consent"], cta: "Request a quote" },
  { slug: "restaurant-funding", provider: "inkind", headline: "Funding options, explained before you sign", sub: "Learn how food-credit and other funding programs work, then decide if it is right for your venue.", benefits: ["Clear overview of funding types and trade-offs", "Eligibility guide, not a credit decision", "We are not a lender; terms vary by provider"], cta: "Ask about funding" },
];
export const getPartner = (slug: string) => PARTNERS.find((p) => p.slug === slug);
