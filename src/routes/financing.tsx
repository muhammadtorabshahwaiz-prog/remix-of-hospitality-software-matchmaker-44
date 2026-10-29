import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { useState } from "react";
import { AlertTriangle, Landmark, TrendingUp, Wrench, Wheat } from "lucide-react";
import { Card } from "@/components/fx";
import { Btn, PageHead, ProviderCard, Section, inputCls } from "@/components/site";
import { providersIn } from "@/data/site";

export const Route = createFileRoute("/financing")({
  head: () => ({ links: [canonical("/financing")], meta: [
    { title: "Restaurant Financing & Loans Hub — Hospitalityservis" },
    { name: "description", content: "Compare merchant cash advances, revenue-based financing, equipment loans and food-credit programs for restaurants." },
    { property: "og:title", content: "Restaurant Financing Hub — Hospitalityservis" },
    { property: "og:description", content: "Understand restaurant funding options and check eligibility." },
  ] }),
  component: Page,
});

const TYPES = [
  [TrendingUp, "Merchant cash advance", "An advance repaid from a share of daily card sales. Fast, but often the most expensive option."],
  [Landmark, "Revenue-based financing", "Fixed fee repaid as a percentage of revenue, flexing with slow and busy months."],
  [Wrench, "Equipment loans", "Finance ovens, refrigeration or POS hardware, secured by the equipment itself."],
  [Wheat, "Food & beverage credit", "inKind-style programs: capital upfront, repaid in food and drink credit at your venue."],
] as const;

function Page() {
  const [rev, setRev] = useState(30000);
  const [months, setMonths] = useState(12);
  const [card, setCard] = useState(70);
  const [checked, setChecked] = useState(false);
  const eligible = months >= 6 && rev >= 10000;
  const est = Math.round((rev * (card / 100) * 1.0) / 1000) * 1000;
  return (
    <>
      <PageHead crumbs={[{ label: "Financing" }]} eyebrow="Funding hub" title="Restaurant financing & loans">Understand your options before you sign. Terms vary by provider and by business.</PageHead>
      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {TYPES.map(([I, t, d]) => <Card key={t} className="p-6"><I className="h-6 w-6 text-primary" /><div className="mt-4 text-lg font-semibold">{t}</div><p className="mt-2 text-sm text-muted-foreground">{d}</p></Card>)}
        </div>
      </Section>
      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Eligibility checker</h2>
            <p className="mt-1 text-sm text-muted-foreground">A rough guide only — not an offer or credit decision.</p>
            <div className="mt-6 space-y-5">
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Monthly revenue: ${rev.toLocaleString()}</span><input type="range" min={0} max={200000} step={5000} value={rev} onChange={(e) => setRev(+e.target.value)} className="mt-2 w-full accent-[var(--primary)]" /></label>
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Months in business</span><input type="number" min={0} value={months} onChange={(e) => setMonths(+e.target.value)} className={`${inputCls} mt-2`} /></label>
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Card sales share: {card}%</span><input type="range" min={0} max={100} value={card} onChange={(e) => setCard(+e.target.value)} className="mt-2 w-full accent-[var(--primary)]" /></label>
              <Btn onClick={() => setChecked(true)}>Check eligibility</Btn>
              {checked && (
                <div className={`border p-4 text-sm ${eligible ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground"}`}>
                  {eligible ? <>You may qualify for options around <span className="font-mono">${est.toLocaleString()}</span>. Request quotes to see real terms.</> : "Most lenders look for 6+ months in business and $10k+ monthly revenue. Equipment loans or food credit may still fit."}
                </div>
              )}
            </div>
          </Card>
          <div className="brackets flex gap-4 border border-primary/40 bg-accent p-6">
            <AlertTriangle className="h-6 w-6 shrink-0 text-primary" />
            <div className="text-sm">
              <div className="font-semibold text-primary">Disclosure</div>
              <p className="mt-2 text-muted-foreground">Hospitalityservis is not a lender. Rates, fees, repayment terms and approval vary by provider and depend on your business. Estimates are illustrative. We may receive a referral fee from providers; this never affects ratings. Always read the full agreement and compare total cost of capital.</p>
            </div>
          </div>
        </div>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-bold">Funding providers</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{providersIn("funding-loans").map((p) => <ProviderCard key={p.slug} p={p} />)}</div>
      </Section>
    </>
  );
}
