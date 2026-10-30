import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Check, Minus } from "lucide-react";
import { Empty, PageHead, Sample, Section, Stars } from "@/components/site";
import { FEATURES as FEATS, getCategory, getProvider, type Provider } from "@/data/site";

type S = { a?: string | undefined; b?: string | undefined; c?: string | undefined };
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): S => ({
    a: typeof s["a"] === "string" && s["a"] ? s["a"] : undefined,
    b: typeof s["b"] === "string" && s["b"] ? s["b"] : undefined,
    c: typeof s["c"] === "string" && s["c"] ? s["c"] : undefined,
  }),
  head: () => ({ links: [canonical("/compare")], meta: [
    { title: "Compare Software Side by Side — Hospitalityservis" },
    { name: "description", content: "Compare up to 3 software products on rating, pricing, features, regions and contract terms." },
    { property: "og:title", content: "Compare Software — Hospitalityservis" },
    { property: "og:description", content: "Side-by-side comparison of up to 3 providers." },
  ] }),
  component: Page,
});


function Page() {
  const { a, b, c } = Route.useSearch();
  const ps = [a, b, c].map((s) => (s ? getProvider(s) : undefined)).filter(Boolean) as Provider[];
  const rows: [string, (p: Provider) => React.ReactNode][] = [
    ["Category", (p) => getCategory(p.category)?.name],
    ["Rating", (p) => <Stars value={p.score} />],
    ["Reviews", (p) => p.reviews.toLocaleString()],
    ["Pricing", (p) => p.priceLabel],
    ["Hardware", (p) => (p.hardware ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />)],
    ["Countries", (p) => p.countries.join(", ")],
    ["Contract", (p) => p.contract],
    ["Company size", (p) => p.companySize],
    ...FEATS.map((f) => [f, (p: Provider) => (p.featureList.includes(f) ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />)] as [string, (p: Provider) => React.ReactNode]),
  ];
  return (
    <>
      <PageHead crumbs={[{ label: "Compare" }]} eyebrow="Side by side" title="Compare providers">Pick up to 3 providers from any category page using the Compare checkbox.</PageHead>
      <Section>
        {ps.length === 0 ? <Empty title="Nothing to compare yet">Tick "Compare" on providers in a <Link to="/categories" className="text-primary">category</Link>, then press Compare now.</Empty> : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b border-border bg-card">
                <th className="p-4 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground"><Sample /></th>
                {ps.map((p) => <th key={p.slug} className="p-4 text-left"><Link to="/software/$slug" params={{ slug: p.slug }} className="text-base font-semibold hover:text-primary">{p.name}</Link></th>)}
              </tr></thead>
              <tbody>{rows.map(([l, f]) => (
                <tr key={l} className="border-b border-border last:border-0 hover:bg-card/60">
                  <td className="p-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{l}</td>
                  {ps.map((p) => <td key={p.slug} className="p-4">{f(p)}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
