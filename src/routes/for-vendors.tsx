import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Check } from "lucide-react";
import { Card } from "@/components/fx";
import { Btn, PageHead, Section, inputCls } from "@/components/site";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { submitLead } from "@/lib/submit";
import { CATEGORIES } from "@/data/site";
import { PARTNERS } from "@/data/partners";

export const Route = createFileRoute("/for-vendors")({
  head: () => ({ links: [canonical("/for-vendors")], meta: [
    { title: "For Vendors — Get Listed on Hospitalityservis" },
    { name: "description", content: "Reach qualified restaurant operators. Free, Pro ($299/mo) and Enterprise plans with reviews, leads and featured placements." },
    { property: "og:title", content: "Get Listed — Hospitalityservis for Vendors" },
    { property: "og:description", content: "Build credibility and get qualified restaurant leads." },
  ] }),
  component: Page,
});

const PLANS = [
  { name: "Free", price: "$0", note: "forever", items: ["Basic profile", "Collect reviews", "Respond to reviews", "Category listing"] },
  { name: "Pro", price: "$299", note: "/mo", items: ["Everything in Free", "Claimed badge", "Demo / quote requests", "Lead notifications", "Profile analytics", "Screenshots and media"], hot: true },
  { name: "Enterprise", price: "Custom", note: "", items: ["Everything in Pro", "Featured placements", "Best-of page sponsorship (labeled)", "Revenue share / cost per lead", "Dedicated partner manager"] },
];

function Page() {
  const { busy, sent, err, onSubmit } = useSubmit((fd) => submitLead({
    type: "vendor_listing", company: str(fd, "company"), website: str(fd, "website"), name: str(fd, "name"), email: str(fd, "email"),
    category: str(fd, "category"), plan: str(fd, "plan"), notes: str(fd, "notes"),
    consent: bool(fd, "consent"), consent_text: "I agree to be contacted by Hospitalityservis about listing my company.", company_url: str(fd, "company_url"),
  }));
  return (
    <>
      <PageHead crumbs={[{ label: "For vendors" }]} eyebrow="Partner with us" title="Reach restaurants ready to buy.">Build credibility with verified reviews and get qualified introductions to operators actively evaluating solutions.</PageHead>
      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.name} className={`p-8 ${p.hot ? "border-primary" : ""}`}>
              <div className="flex items-center justify-between"><div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{p.name}</div>{p.hot && <span className="bg-primary px-2 py-0.5 font-mono text-[10px] uppercase text-primary-foreground">Popular</span>}</div>
              <div className="mt-4 font-mono text-4xl font-bold text-primary">{p.price}<span className="text-base text-muted-foreground">{p.note}</span></div>
              <ul className="mt-6 space-y-2.5 text-sm">{p.items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{i}</li>)}</ul>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Paid plans never change ratings or review content. Sponsored placements are always labeled.</p>
      </Section>
      <Section className="pt-0">
        <h2 className="text-3xl font-bold">Branded landing pages</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Enterprise partners get a dedicated page we host, with a tracked lead form (UTM, referrer and partner recorded). Sample pages:</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((p) => <Link key={p.slug} to="/go/$slug" params={{ slug: p.slug }} className="border border-border bg-card p-4 text-sm hover:border-primary"><div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">/go/{p.slug}</div><div className="mt-2 font-semibold">{p.headline}</div></Link>)}
        </div>
      </Section>
      <Section className="max-w-3xl pt-0">
        <h2 className="text-3xl font-bold">Get listed</h2>
        {sent ? <div className="mt-6"><Sent mode={sent}>Thanks. Our partnerships team will reach out.</Sent></div> : (
          <form onSubmit={onSubmit} noValidate className="relative mt-6 grid gap-3 sm:grid-cols-2">
            <Honeypot />
            <input name="company" required maxLength={120} placeholder="Company name" className={inputCls} />
            <input name="website" required maxLength={200} placeholder="Website" className={inputCls} />
            <input name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
            <input name="email" required type="email" maxLength={255} placeholder="Work email" className={inputCls} />
            <select name="category" className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug}>{c.name}</option>)}</select>
            <select name="plan" className={inputCls}><option>Free</option><option>Pro</option><option>Enterprise</option></select>
            <textarea name="notes" rows={4} maxLength={2000} placeholder="Tell us about your product and ideal customer" className={`${inputCls} sm:col-span-2`} />
            <label className="flex items-start gap-2 text-sm text-muted-foreground sm:col-span-2"><input name="consent" type="checkbox" className="mt-1 accent-[var(--primary)]" />I agree to be contacted by Hospitalityservis about listing my company.</label>
            <div className="sm:col-span-2"><FormError message={err} /></div>
            <div className="sm:col-span-2"><Btn type="submit">{busy ? "Sending..." : "Get listed"}</Btn></div>
          </form>
        )}
      </Section>
    </>
  );
}
