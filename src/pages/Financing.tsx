import { useState } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/marketplace";
import { usePageTitle } from "@/lib/seo";

const fundingTypes = [
  ["Revenue-based funding", "Repayment flexes with sales. Useful when revenue is steady but a fixed monthly payment would be restrictive."],
  ["Equipment financing", "Spread the cost of equipment over time. Compare the full repayment amount, term, fees, and ownership conditions."],
  ["Merchant cash advance", "An advance repaid from future sales. Understand the factor rate, holdback, total cost, and cash-flow impact."],
  ["Food-and-beverage credit", "Some programs provide capital repaid through venue credit. Review redemption rules, expiry, and what happens if the business closes."],
];

export default function Financing() {
  usePageTitle("Business financing guide", "Learn about revenue-based funding, equipment loans, merchant cash advances, and food credit. Educational only; terms vary.");
  const [result, setResult] = useState("");
  const check = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const months = Number(form.get("months"));
    const revenue = Number(form.get("revenue"));
    const amount = Number(form.get("amount"));
    if (!months || !revenue || !amount) { setResult("Complete all three fields to see educational options."); return; }
    const ratio = amount / revenue;
    const options = months >= 24 && revenue >= 25000 ? ["equipment financing", "revenue-based funding"] : ["revenue-based funding", "merchant cash advance"];
    setResult(`With $${amount.toLocaleString()} requested against $${revenue.toLocaleString()} monthly revenue (a ${ratio.toFixed(2)}× ratio), you could research ${options.join(" and ")}. This is not an eligibility decision or offer. Compare total cost and repayment impact with qualified providers.`);
  };
  return <><PageHeader eyebrow="Financing education hub" title={<>Understand the cost<br />before the capital.</>} breadcrumbs={[{ label: "Financing" }]}><p>Educational guidance for hospitality and small-business operators. Hospitalityservis is not a lender, and this page does not make credit decisions or offers.</p></PageHeader><div className="site-container py-16 sm:py-24"><div className="grid gap-12 lg:grid-cols-[1fr_400px]"><section><p className="mono-label text-primary">Funding types</p><h2 className="display-md mt-4">Different structures. Different trade-offs.</h2><div className="mt-10 border-t border-border">{fundingTypes.map(([title,copy],index)=><article key={title} className="grid gap-4 border-b border-border py-7 sm:grid-cols-[40px_1fr]"><span className="font-mono text-sm text-primary">0{index+1}</span><div><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-2 text-muted-foreground">{copy}</p></div></article>)}</div></section><aside className="h-fit border border-border bg-card p-6 sm:p-8"><p className="mono-label text-primary">Eligibility explorer</p><h2 className="mt-4 font-display text-2xl font-bold">Research a starting point.</h2><form onSubmit={check} className="mt-6 space-y-5"><label className="block text-sm font-semibold">Months in business<input name="months" type="number" min="0" max="1200" required className="field mt-2" /></label><label className="block text-sm font-semibold">Average monthly revenue (USD)<input name="revenue" type="number" min="1" required className="field mt-2" /></label><label className="block text-sm font-semibold">Funding amount sought (USD)<input name="amount" type="number" min="1" required className="field mt-2" /></label><button type="submit" className="btn-primary w-full">Explore options</button></form>{result && <p role="status" className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">{result}</p>}</aside></div><div className="mt-16 border-t border-border pt-8"><h2 className="font-display text-2xl font-bold">Before you sign</h2><p className="mt-3 max-w-3xl text-muted-foreground">Ask for the total repayment amount, all fees, payment frequency, personal guarantees, collateral, early-payoff terms, renewal conditions, and what happens after a slow sales period. Consider advice from a qualified financial or legal professional.</p><Link to="/contact" className="btn-secondary mt-6">Ask a financing question</Link></div></div></>;
}
