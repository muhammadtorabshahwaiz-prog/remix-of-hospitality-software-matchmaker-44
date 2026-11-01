import { Link } from "react-router";
import { PageHeader } from "@/components/marketplace";
import { usePageTitle } from "@/lib/seo";

export type InfoPageType = "about" | "methodology" | "disclosure" | "privacy" | "terms" | "accessibility";
const pages: Record<InfoPageType, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string[] }[] }> = {
  about: {
    eyebrow: "About Hospitalityservis", title: "Where software connects, evaluates, and grows.", intro: "A professional discovery network for buyers and vendors, built around useful feedback, transparent comparisons, and qualified business connections.",
    sections: [
      { title: "Two sides, one useful marketplace", body: ["Buyers need a clearer way to discover and evaluate software without giving up control of their contact details. Vendors need a credible place to build reputation and meet qualified customers.", "Hospitalityservis connects those needs through reviews, comparisons, buyer guides, and introductions requested by the buyer."] },
      { title: "From hospitality to every kind of software", body: ["The project began with restaurant operators and hospitality providers. That focus on operational fit, total cost, and honest local feedback now informs a broader software directory spanning 30 categories.", "The hospitality catalog remains an important part of the platform, alongside CRM, support, productivity, HR, security, AI, and commerce."] },
      { title: "The business model", body: ["The platform may earn agreed referral revenue, revenue share, qualified-lead fees, or subscription fees from vendors. Buyers can browse and request introductions without paying Hospitalityservis.", "Commercial relationships are disclosed. A positive review is never a condition of accepting an introduction, purchasing a product, or giving a referral."] },
    ],
  },
  methodology: {
    eyebrow: "How the platform works", title: "Rankings should show their workings.", intro: "Our methodology separates organic evaluation from paid visibility and distinguishes sample catalog content from moderated user submissions.",
    sections: [
      { title: "How the community score is worked out", body: ["Only approved reviews count. Newer reviews count more, with a half-life of about eighteen months, and old reviews never drop below a quarter of their weight. Verified reviewers count 25% more, reviews where the writer disclosed an incentive count 40% less, and reviews other buyers marked helpful count slightly more, up to 50%.", "The result is pulled gently toward 3.8 using three imaginary reviews, so one enthusiastic review cannot outrank a product with hundreds. The plain average is always shown next to it. Vendors can reply to a review but cannot edit, hide or remove it, and paying for a plan never changes a score."] },
      { title: "Sample content versus published reviews", body: ["The current brand catalog, ratings, review counts, pros, cons, and sample reviews are illustrative placeholders and carry a Sample label. They are not represented as live customer evidence.", "New user reviews enter a pending queue. Only approved reviews become public. A Verified label appears only when a verification timestamp exists after moderation."] },
      { title: "Organic sorting and sponsored placements", body: ["Category pages can be sorted by sample rating, review count, or newest profile. Paid placement never changes those organic results.", "Sponsored slots, when active, appear in a separately labeled area. Vendors cannot edit or delete reviews, and payment cannot purchase a rating."] },
      { title: "Review integrity and incentives", body: ["Reviewers must confirm their feedback reflects genuine experience. Incentives and commercial relationships have dedicated disclosure fields.", "Moderators may approve, reject, or mark a review verified. Verification is not automatic, and an approved review is not necessarily verified."] },
      { title: "Introductions and lead handling", body: ["A buyer chooses when to request a demo or quote. The request form names the provider that may receive the details and requires explicit consent.", "Vendors can access leads only for profiles for which they have an approved claim. Site administrators can route and track lead status."] },
    ],
  },
  disclosure: {
    eyebrow: "Commercial disclosure", title: "How Hospitalityservis may make money.", intro: "Clear commercial disclosure helps readers understand the difference between independent evaluation and paid visibility.",
    sections: [
      { title: "Vendor plans and featured placements", body: ["Vendors may pay for profile services, subscriptions, or clearly labeled sponsored placements. Sponsored content is identified and separated from organic ranking.", "A vendor subscription does not improve a product’s rating, review count, or organic sort position."] },
      { title: "Leads, referrals, and revenue share", body: ["When a buyer explicitly requests an introduction, Hospitalityservis may receive a qualified-lead fee, referral commission, or agreed revenue share from a participating provider.", "These arrangements do not obligate the buyer to purchase. Recommendations and review publication must never be conditional on a transaction."] },
      { title: "Sample catalog notice", body: ["Until real provider and review data replaces it, the catalog is a product preview. Real company names appear with invented illustrative ratings and counts labeled Sample; these must not be treated as factual assessments of those companies."] },
    ],
  },
  privacy: {
    eyebrow: "Privacy", title: "Your information stays under your control.", intro: "This preview stores only the information needed to operate accounts, reviews, saved products, vendor claims, and requested introductions.",
    sections: [
      { title: "Information you provide", body: ["Review submissions include your name, email, optional role, company and city, ratings, written feedback, and disclosure information. Lead forms include the contact and request details you choose to provide.", "Account authentication is handled through the platform sign-in service. Vendor claims additionally store a business email, website, and note."] },
      { title: "How information is used and shared", body: ["Reviewer emails are used for administration and are not published. Lead details are visible to site administrators and to a vendor only when the lead concerns a provider profile with an approved vendor claim.", "UTM and referral parameters may be stored in session storage and attached to a lead to measure the source of a requested introduction."] },
      { title: "Retention and choices", body: ["Records are retained while needed for marketplace operation, moderation, security, and legitimate business records. Contact the team to request access, correction, or deletion, subject to applicable obligations.", "The site does not use advertising analytics in this version. Authentication and security cookies are used only where needed for sign-in and platform operation."] },
    ],
  },
  accessibility: {
    eyebrow: "Accessibility", title: "A site everyone can use.", intro: "We want Hospitalityservis to work for people with different abilities, devices and preferences. These are the tools built in and how to reach us if something gets in your way.",
    sections: [
      { title: "Settings you can change", body: ["Use the accessibility button at the bottom left of any page to switch between Auto, Light and Dark, enlarge text up to 150%, turn on high contrast, reduce motion, use a more readable font, stop the glitch and cursor effects, or mute all sounds. Your choices are saved in your browser."] },
      { title: "Keyboard and screen readers", body: ["Every page can be used with a keyboard, and the focus outline is always visible. The animated network on the home page has a hidden list of category links for screen readers, so you never need the animation to find a category."] },
      { title: "Tell us about a problem", body: ["If something is hard to use, please tell us through the contact page with the page address and what happened. We will respond and fix what we can."] },
    ],
  },
  terms: {
    eyebrow: "Terms of use", title: "Rules for a useful, honest marketplace.", intro: "By using this preview, you agree to provide lawful, genuine content and to evaluate sample information as illustrative rather than factual.",
    sections: [
      { title: "Acceptable use", body: ["Do not submit fabricated experience, impersonate another person, scrape restricted data, attempt unauthorized access, or use forms for spam. Reviewers must disclose incentives and relevant commercial relationships.", "Vendors may respond to reviews but may not intimidate reviewers or manipulate the review process."] },
      { title: "No professional or purchasing advice", body: ["Directory content is general information, not a recommendation to purchase. Verify features, pricing, security, and contract terms directly with providers.", "Financing content is educational and is not a loan offer, credit decision, or financial advice. Terms and eligibility vary by provider and applicant."] },
      { title: "Preview status", body: ["The catalog contains illustrative ratings and company information labeled Sample. The platform may change, moderate, or remove content to protect integrity and operate the service.", "These terms are a product-preview summary and should be reviewed by qualified counsel before a commercial launch."] },
    ],
  },
};

export default function InfoPage({ type }: { type: InfoPageType }) {
  const page = pages[type];
  usePageTitle(page.eyebrow, page.intro);
  return (
    <>
      <PageHeader eyebrow={page.eyebrow} title={page.title} breadcrumbs={[{ label: page.eyebrow }]}><p>{page.intro}</p></PageHeader>
      <div className="site-container py-16 sm:py-24"><div className="max-w-4xl">{page.sections.map((section, index) => <section key={section.title} className="grid gap-5 border-t border-border py-10 sm:grid-cols-[52px_1fr]"><span className="font-mono text-sm text-primary">0{index + 1}</span><div><h2 className="font-display text-2xl font-extrabold">{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph} className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{paragraph}</p>)}</div></section>)}</div><div className="mt-10 border-t border-border pt-8"><Link to="/contact" className="btn-secondary">Questions? Contact us</Link></div></div>
    </>
  );
}
