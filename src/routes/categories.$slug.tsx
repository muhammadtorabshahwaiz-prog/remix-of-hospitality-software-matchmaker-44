import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Empty, PageHead, ProviderCard, Sample, Section, inputCls } from "@/components/site";
import { getCategory, providersIn, BEST } from "@/data/site";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => { const c = getCategory(params.slug); if (!c) throw notFound(); return c; },
  head: ({ loaderData }) => ({ meta: loaderData ? [
    { title: `Best ${loaderData.name} for Restaurants — Reviews & Comparison` },
    { name: "description", content: loaderData.intro },
    { property: "og:title", content: `${loaderData.name} for Restaurants — Hospitalityservis` },
    { property: "og:description", content: loaderData.intro },
  ] : [{ title: "Category not found" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => <Section><Empty title="Category not found"><Link to="/categories" className="text-primary">Browse all categories</Link></Empty></Section>,
  errorComponent: () => <Section><Empty title="Something went wrong loading this category" /></Section>,
  component: Page,
});

const FEATURES = ["Online ordering", "Tableside", "Offline mode", "Loyalty", "Inventory", "API", "Multi-location", "24/7 support"];

function Page() {
  const c = Route.useLoaderData();
  const all = providersIn(c.slug);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300);
  const [country, setCountry] = useState("Any");
  const [hardware, setHardware] = useState(false);
  const [size, setSize] = useState("Any");
  const [feats, setFeats] = useState<string[]>([]);
  const [sort, setSort] = useState("top");
  const list = useMemo(() => all
    .filter((p) => p.score >= minRating && p.priceFrom <= maxPrice && (country === "Any" || p.countries.includes(country as "US")) && (!hardware || p.hardware) && (size === "Any" || p.companySize === size) && feats.every((f) => p.featureList.includes(f)))
    .sort((a, b) => sort === "top" ? b.score - a.score : sort === "reviews" ? b.reviews - a.reviews : b.year - a.year),
  [all, minRating, maxPrice, country, hardware, size, feats, sort]);
  const best = BEST.find((b) => b.category === c.slug);
  const reset = () => { setMinRating(0); setMaxPrice(300); setCountry("Any"); setHardware(false); setSize("Any"); setFeats([]); };
  const lbl = "font-mono text-[11px] uppercase tracking-widest text-muted-foreground";
  return (
    <>
      <PageHead crumbs={[{ label: "Categories", to: "/categories" }, { label: c.name }]} eyebrow="Category" title={<>{c.name} <span className="text-muted-foreground">for restaurants</span></>}>{c.intro}</PageHead>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-6 border border-border bg-card p-5 lg:sticky lg:top-24">
            <div><div className={lbl}>Min rating: {minRating.toFixed(1)}</div><input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="mt-2 w-full accent-[var(--primary)]" /></div>
            <div><div className={lbl}>Max price: ${maxPrice}/mo</div><input type="range" min={0} max={300} step={10} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-2 w-full accent-[var(--primary)]" /></div>
            <div><div className={lbl}>Country</div><select value={country} onChange={(e) => setCountry(e.target.value)} className={`${inputCls} mt-2 py-2`}><option>Any</option><option>US</option><option>Canada</option></select></div>
            <div><div className={lbl}>Company size</div><select value={size} onChange={(e) => setSize(e.target.value)} className={`${inputCls} mt-2 py-2`}><option>Any</option><option>Small</option><option>Mid</option><option>Enterprise</option></select></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hardware} onChange={(e) => setHardware(e.target.checked)} className="accent-[var(--primary)]" />Includes hardware</label>
            <div><div className={lbl}>Features</div>
              <div className="mt-2 space-y-1.5">{FEATURES.map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={feats.includes(f)} onChange={() => setFeats(feats.includes(f) ? feats.filter((x) => x !== f) : [...feats, f])} className="accent-[var(--primary)]" />{f}</label>
              ))}</div>
            </div>
            <button onClick={reset} className="text-sm text-primary">Reset filters</button>
          </aside>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{list.length} providers <Sample /></div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={`${inputCls} w-auto py-2`}><option value="top">Top Rated</option><option value="reviews">Most Reviewed</option><option value="new">Newest</option></select>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Tick "Compare" on up to 3 providers.</p>
            <div className="mt-6">
              {list.length === 0 ? <Empty title="No providers match these filters"><button onClick={reset} className="text-primary">Reset filters</button></Empty> :
                <div className="grid gap-4 md:grid-cols-2">{list.map((p) => <ProviderCard key={p.slug} p={p} />)}</div>}
            </div>
          </div>
        </div>
      </Section>
      <Section className="pt-0">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Best for</h2>
            <ul className="mt-5 space-y-3">
              {[["Food trucks", "Mobile hardware and offline mode"], ["Full-service", "Tableside ordering and coursing"], ["Multi-location groups", "Central menus and reporting"]].map(([a, b]) => (
                <li key={a} className="border border-border bg-card p-4"><div className="font-semibold">{a}</div><div className="text-sm text-muted-foreground">{b}</div></li>
              ))}
            </ul>
            {best && <Link to="/best/$slug" params={{ slug: best.slug }} className="mt-5 inline-block text-sm text-primary">See ranking: {best.title}</Link>}
          </div>
          <div>
            <h2 className="text-2xl font-bold">FAQ</h2>
            <Accordion type="single" collapsible className="mt-3">
              {[[`How do I choose ${c.name.toLowerCase()}?`, "Start with your service model and volume, then compare total cost (fees, hardware, add-ons) and support quality."], ["Are reviews verified?", "Reviews come from operators we have spoken with and are published with their permission."], ["Do you get paid by providers?", "Some providers pay referral or lead fees. That never affects ratings — see our methodology."]].map(([q, a]) => (
                <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Section>
    </>
  );
}
