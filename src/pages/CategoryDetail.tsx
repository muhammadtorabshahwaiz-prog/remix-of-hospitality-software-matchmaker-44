import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { EmptyState, PageHeader, ProviderRow, SampleBadge } from "@/components/marketplace";
import { FEATURES, getCategory, getProvider, providersIn, type Region } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";
import NotFound from "./NotFound";

export default function CategoryDetail() {
  const { slug = "" } = useParams();
  const category = getCategory(slug);
  usePageTitle(category?.name || "Category not found", category?.intro);
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [region, setRegion] = useState("All");
  const [size, setSize] = useState("All");
  const [feature, setFeature] = useState("All");
  const [sort, setSort] = useState("rating");
  const sponsoredQuery = trpc.marketplace.activeSponsoredSlots.useQuery({ categorySlug: slug }, { enabled: Boolean(category), retry: false });

  const providers = useMemo(() => {
    const filtered = providersIn(slug).filter((provider) =>
      provider.score >= rating &&
      (!price || provider.priceTier === price) &&
      (region === "All" || provider.countries.includes(region as Region)) &&
      (size === "All" || provider.companySize === size) &&
      (feature === "All" || provider.featureList.includes(feature)),
    );
    return filtered.sort((a, b) => sort === "reviews" ? b.reviews - a.reviews : sort === "newest" ? b.year - a.year : b.score - a.score);
  }, [slug, rating, price, region, size, feature, sort]);

  if (!category) return <NotFound />;
  const sponsored = (sponsoredQuery.data || []).map((slot) => getProvider(slot.providerSlug)).filter((provider) => provider !== undefined);
  const reset = () => { setRating(0); setPrice(0); setRegion("All"); setSize("All"); setFeature("All"); };

  return (
    <>
      <PageHeader eyebrow={category.group} title={category.name} breadcrumbs={[{ label: "Categories", to: "/categories" }, { label: category.name }]}>
        <p>{category.intro}</p>
        <div className="mt-5 flex items-center gap-3"><SampleBadge /><span className="text-sm">Ratings and counts are illustrative.</span></div>
      </PageHeader>
      <div className="site-container grid gap-10 py-12 lg:grid-cols-[260px_1fr] lg:py-20">
        <aside>
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between"><h2 className="mono-label flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Filter products</h2><button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-primary">Reset</button></div>
            <div className="mt-6 space-y-5 border-t border-border pt-6">
              <label className="block text-sm font-semibold">Minimum sample rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="field mt-2"><option value={0}>Any rating</option><option value={4}>4.0 & up</option><option value={4.5}>4.5 & up</option></select></label>
              <label className="block text-sm font-semibold">Price tier<select value={price} onChange={(event) => setPrice(Number(event.target.value))} className="field mt-2"><option value={0}>Any price</option><option value={1}>$ · Entry</option><option value={2}>$$ · Mid-market</option><option value={3}>$$$ · Enterprise</option></select></label>
              <label className="block text-sm font-semibold">Region<select value={region} onChange={(event) => setRegion(event.target.value)} className="field mt-2"><option>All</option>{["US", "Canada", "UK", "EU", "APAC"].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-sm font-semibold">Company size<select value={size} onChange={(event) => setSize(event.target.value)} className="field mt-2"><option>All</option><option>Small</option><option>Mid</option><option>Enterprise</option></select></label>
              <label className="block text-sm font-semibold">Feature<select value={feature} onChange={(event) => setFeature(event.target.value)} className="field mt-2"><option>All</option>{FEATURES.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="mt-8 border-t border-border pt-6"><p className="mono-label text-primary">Need a shortlist?</p><p className="mt-3 text-sm text-muted-foreground">Request a demo from a product profile only when you are ready. Your details stay private until then.</p></div>
          </div>
        </aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <p className="mono-label text-muted-foreground">{providers.length} organic results</p>
            <label className="flex items-center gap-3 text-sm">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)} className="border border-border bg-background px-3 py-2"><option value="rating">Top rated</option><option value="reviews">Most reviewed</option><option value="newest">Newest</option></select></label>
          </div>
          {sponsored.length > 0 && <section className="border-b border-border"><p className="mono-label bg-card px-4 py-3 text-muted-foreground sm:px-6">Paid placements · separate from organic ranking</p>{sponsored.map((provider) => <ProviderRow key={provider.slug} provider={provider} sponsored />)}</section>}
          {providers.length ? providers.map((provider, index) => <ProviderRow key={provider.slug} provider={provider} rank={index + 1} />) : <div className="mt-8"><EmptyState title="No products match these filters">Reset one or more filters to widen your shortlist.</EmptyState></div>}
        </div>
      </div>
      <section className="border-t border-border bg-card/40">
        <div className="site-container grid gap-10 py-20 lg:grid-cols-2">
          <div><p className="mono-label text-primary">Best for</p><h2 className="display-md mt-4">Choosing {category.name.toLowerCase()}.</h2><p className="mt-5 max-w-xl text-muted-foreground">Start with the workflow you need to improve, then check total cost, implementation effort, integrations, and support. A high sample score is only a starting point—not a substitute for your own evaluation.</p><Link to={`/compare?products=${providers.slice(0, 2).map((provider) => provider.slug).join(",")}`} className={providers.length >= 2 ? "btn-primary mt-7" : "hidden"}>Compare the top two <ArrowRight className="h-4 w-4" /></Link></div>
          <div><h3 className="mono-label">Frequently asked questions</h3><div className="mt-5 border-t border-border">{[
            ["How is the organic order calculated?", "In this preview, organic results use the sample rating you select in the sort control. Paid placement never changes that order."],
            ["Are these live customer ratings?", "No. Current catalog ratings and review counts are labeled Sample. Submitted reviews appear only after moderation."],
            ["Does requesting a demo cost anything?", "No. Buyer requests are free and carry no obligation to purchase or switch providers."],
          ].map(([question, answer]) => <details key={question} className="border-b border-border py-5"><summary className="font-display text-lg font-bold">{question}</summary><p className="mt-3 text-muted-foreground">{answer}</p></details>)}</div></div>
        </div>
      </section>
    </>
  );
}
