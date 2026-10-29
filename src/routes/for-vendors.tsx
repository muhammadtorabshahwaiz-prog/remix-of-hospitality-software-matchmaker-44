import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/fx";
import { Btn, PageHead, Section, inputCls } from "@/components/site";
import { CATEGORIES } from "@/data/site";

export const Route = createFileRoute("/for-vendors")({
  head: () => ({ meta: [
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
  const [sent, setSent] = useState(false);
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
      <Section className="max-w-3xl pt-0">
        <h2 className="text-3xl font-bold">Get listed</h2>
        {sent ? <div className="mt-6 flex items-center gap-2 border border-primary bg-accent p-6 text-primary"><Check className="h-5 w-5" />Thanks — our partnerships team will reach out.</div> : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-6 grid gap-3 sm:grid-cols-2">
            <input required placeholder="Company name" className={inputCls} />
            <input required placeholder="Website" className={inputCls} />
            <input required placeholder="Your name" className={inputCls} />
            <input required type="email" placeholder="Work email" className={inputCls} />
            <select className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug}>{c.name}</option>)}</select>
            <select className={inputCls}><option>Free</option><option>Pro</option><option>Enterprise</option></select>
            <textarea rows={4} placeholder="Tell us about your product and ideal customer" className={`${inputCls} sm:col-span-2`} />
            <div className="sm:col-span-2"><Btn type="submit">Get listed</Btn></div>
          </form>
        )}
      </Section>
    </>
  );
}
