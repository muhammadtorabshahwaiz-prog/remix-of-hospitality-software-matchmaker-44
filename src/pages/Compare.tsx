import { SaveComparison } from "@/components/save-comparison";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, Check, Minus } from "lucide-react";
import { useCompare } from "@/components/compare-context";
import { EmptyState, PageHeader, SampleBadge, Stars } from "@/components/marketplace";
import { FEATURES, getProvider } from "@/data/site";
import { usePageTitle } from "@/lib/seo";

export default function Compare() {
  usePageTitle("Compare software", "Compare up to three software products side by side across ratings, pricing, features, regions, and contract terms.");
  const [params] = useSearchParams();
  const { selected, clear } = useCompare();
  const fromUrl = params.get("products") || [params.get("a"), params.get("b"), params.get("c")].filter(Boolean).join(",");
  const slugs = (fromUrl || selected.join(",")).split(",").filter(Boolean).slice(0, 3);
  const providers = slugs.map((slug) => getProvider(slug)).filter((provider) => provider !== undefined);

  const rows: { label: string; value: (provider: NonNullable<typeof providers[number]>) => React.ReactNode }[] = [
    { label: "Sample rating", value: (provider) => <Stars value={provider.score} /> },
    { label: "Sample reviews", value: (provider) => provider.reviews.toLocaleString() },
    { label: "Pricing tier", value: (provider) => provider.priceLabel },
    { label: "Best fit", value: (provider) => `${provider.companySize} business` },
    { label: "Regions", value: (provider) => provider.countries.join(", ") },
    { label: "Contract", value: (provider) => provider.contract },
    { label: "Hardware", value: (provider) => provider.hardware ? "Required / offered" : "None specified" },
    ...FEATURES.map((feature) => ({ label: feature, value: (provider: NonNullable<typeof providers[number]>) => provider.featureList.includes(feature) ? <Check className="h-5 w-5 text-primary" aria-label="Included" /> : <Minus className="h-5 w-5 text-muted-foreground" aria-label="Not listed" /> })),
  ];

  return (
    <>
      <PageHeader eyebrow="Side-by-side evaluation" title={<>Compare the details.<br />Keep your shortlist.</>} breadcrumbs={[{ label: "Compare" }]}>
        <p>Compare up to three products. Sample values are illustrative; verify current pricing, features, and terms with each vendor.</p>
        {providers.length > 0 && <div className="mt-5"><SampleBadge /></div>}
      </PageHeader>
      <div className="site-container py-16 sm:py-24">
        {!providers.length ? <EmptyState title="Your comparison is empty">Add two or three products from any category page, then return here for a side-by-side view.<Link to="/categories" className="btn-primary mt-6">Browse software <ArrowRight className="h-4 w-4" /></Link></EmptyState> : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="mono-label text-muted-foreground">{providers.length} of 3 comparison slots</p><SaveComparison slugs={providers.map((p) => p.slug)} /><div className="flex gap-3"><Link to="/categories" className="btn-secondary">Add products</Link><button type="button" onClick={clear} className="btn-secondary">Clear tray</button></div></div>
            <div className="border-t border-border">
              <table className="w-full table-fixed border-collapse text-left">
                <thead><tr className="border-b border-border"><th className="w-[22%] px-2 py-6 align-bottom sm:px-4"><span className="mono-label text-muted-foreground">Product</span></th>{providers.map((provider) => <th key={provider.slug} className="border-l border-border px-2 py-6 align-bottom sm:px-4"><Link to={`/software/${provider.slug}`} className="font-display text-sm font-extrabold leading-tight link-underline hover:text-primary sm:text-2xl">{provider.name}</Link><p className="mono-label mt-3 hidden text-muted-foreground sm:block">{provider.category.replaceAll("-", " ")}</p></th>)}</tr></thead>
                <tbody>{rows.map((row) => <tr key={row.label} className="border-b border-border"><th scope="row" className="px-2 py-5 align-top text-xs font-semibold sm:px-4 sm:text-sm">{row.label}</th>{providers.map((provider) => <td key={provider.slug} className="border-l border-border px-2 py-5 align-top text-xs sm:px-4 sm:text-sm">{row.value(provider)}</td>)}</tr>)}</tbody>
                <tfoot><tr><td /><>{providers.map((provider) => <td key={provider.slug} className="border-l border-border px-2 py-6 sm:px-4"><Link to={`/software/${provider.slug}`} className="mono-label text-primary link-underline">View profile</Link></td>)}</></tr></tfoot>
              </table>
            </div>
            {providers.length === 1 && <p className="mt-6 border border-primary/40 bg-primary/10 p-4 text-sm">Add at least one more product to make this a useful comparison.</p>}
          </>
        )}
      </div>
    </>
  );
}
