import { Link } from "react-router";
import { ArrowRight, BarChart3, BadgeCheck, GitCompareArrows, Inbox, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/marketplace";
import { SimpleLeadForm } from "@/components/simple-lead-form";
import { usePageTitle } from "@/lib/seo";

const plans = [
  { name: "Free", price: "$0", description: "A credible starting point for your profile.", features: ["Claim and manage a profile", "Receive consented demo requests", "Respond to published reviews", "Use the profile badge"], cta: "Get listed" },
  { name: "Pro", price: "$299/mo", description: "More visibility and lead workflow for growing teams.", features: ["Everything in Free", "Eligible for labeled featured slots", "Lead status and notes workflow", "Category and competitor insights"], cta: "Ask about Pro" },
  { name: "Enterprise", price: "Custom", description: "For multi-product and regional vendor teams.", features: ["Everything in Pro", "Multiple products and markets", "Custom lead-routing requirements", "Partnership and reporting support"], cta: "Contact sales" },
];

export default function ForVendors() {
  usePageTitle("For software vendors", "Claim a software profile, collect honest reviews, receive qualified leads, and sponsor clearly labeled placements.");
  return (
    <>
      <PageHeader eyebrow="For software vendors" title={<>Reach buyers<br />without buying trust.</>} breadcrumbs={[{ label: "For vendors" }]}><p>Build a credible profile, respond to honest feedback, and receive qualified introductions. Paid visibility is labeled and never changes organic ratings.</p><Link to="/vendor" className="btn-primary mt-7">Open vendor workspace <ArrowRight className="h-4 w-4" /></Link></PageHeader>
      <section className="site-container py-16 sm:py-24"><div className="grid border-t border-border md:grid-cols-4">{[[BadgeCheck,"Own your profile","Submit a claim and manage your presence after approval."],[Inbox,"Receive qualified leads","See only leads attached to your approved provider profiles."],[GitCompareArrows,"Respond in public","Answer published reviews without editing or deleting them."],[BarChart3,"Understand demand","Track lead status and conversion from your workspace."]].map(([Icon,title,copy])=>{const I=Icon as typeof BadgeCheck;return <div key={String(title)} className="border-b border-border py-8 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><I className="h-6 w-6 text-primary"/><h2 className="mt-5 font-display text-xl font-bold">{String(title)}</h2><p className="mt-3 text-muted-foreground">{String(copy)}</p></div>})}</div></section>
      <section className="border-y border-border bg-card/40"><div className="site-container py-20 sm:py-24"><p className="mono-label text-primary">Vendor plans</p><h2 className="display-md mt-4">Choose the workflow you need.</h2><div className="mt-12 grid border-t border-border lg:grid-cols-3">{plans.map((plan)=><article key={plan.name} className="flex flex-col border-b border-border py-8 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"><p className="mono-label text-muted-foreground">{plan.name}</p><p className="mt-4 font-display text-4xl font-extrabold">{plan.price}</p><p className="mt-4 text-muted-foreground">{plan.description}</p><ul className="mt-7 flex-1 space-y-3">{plan.features.map((feature)=><li key={feature} className="border-b border-border pb-3 text-sm">{feature}</li>)}</ul><a href="#get-listed" className="btn-secondary mt-8">{plan.cta}</a></article>)}</div><p className="mt-6 flex gap-3 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />Plans describe the intended commercial model. No payment is collected in this preview. Sponsored availability is separate and always labeled.</p></div></section>
      <section id="get-listed" className="site-container grid gap-12 py-20 lg:grid-cols-[1fr_320px] lg:py-28"><div><p className="mono-label text-primary">Get listed</p><h2 className="display-md mb-8 mt-4">Tell us about your product.</h2><SimpleLeadForm type="vendor_listing" showProduct consentLabel="I agree that Hospitalityservis may contact me about this vendor profile, plan, or partnership request." submitLabel="Submit vendor request" /></div><aside className="border-t border-border pt-6"><h2 className="font-display text-2xl font-bold">Already have an account?</h2><p className="mt-3 text-muted-foreground">Open your workspace to save products, submit a profile claim, and manage approved leads.</p><Link to="/vendor" className="btn-primary mt-6">Vendor workspace</Link></aside></section>
    </>
  );
}
