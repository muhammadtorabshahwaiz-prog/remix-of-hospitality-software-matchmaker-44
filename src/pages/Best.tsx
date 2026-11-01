import { Link, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, ProviderRow, SampleBadge } from "@/components/marketplace";
import { BEST, getCategory, providersIn } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import NotFound from "./NotFound";

export default function Best() {
  const { slug = "" } = useParams();
  const guide = BEST.find((item) => item.slug === slug);
  usePageTitle(guide?.title || "Guide not found", guide?.lead);
  if (!guide) return <NotFound />;
  const category = getCategory(guide.category);
  const providers = [...providersIn(guide.category)].sort((a, b) => b.score - a.score);
  return (
    <>
      <PageHeader eyebrow="Buyer guide · 2026 preview" title={guide.title} breadcrumbs={[{ label: "Categories", to: "/categories" }, { label: category?.name || "Guide", to: `/categories/${guide.category}` }, { label: "Best of" }]}>
        <p>{guide.lead}</p><div className="mt-5 flex items-center gap-3"><SampleBadge /><span className="text-sm">Demonstration ranking, not live market research.</span></div>
      </PageHeader>
      <div className="site-container grid gap-12 py-16 lg:grid-cols-[1fr_300px] lg:py-24">
        <section><h2 className="font-display text-2xl font-extrabold">Sample shortlist</h2><p className="mt-3 text-muted-foreground">Ordered by illustrative rating. Sponsored status never changes this order.</p><div className="mt-8 border-t border-border">{providers.map((provider, index) => <ProviderRow key={provider.slug} provider={provider} rank={index + 1} />)}</div></section>
        <aside className="h-fit border-t border-border pt-6 lg:sticky lg:top-24"><p className="mono-label text-primary">Methodology</p><h2 className="mt-4 font-display text-2xl font-bold">How to use this guide.</h2><ol className="mt-6 space-y-5 text-muted-foreground"><li><strong className="text-foreground">1. Define your workflow.</strong> List the must-have outcome before comparing brands.</li><li><strong className="text-foreground">2. Check fit and total cost.</strong> Include seats, add-ons, hardware, implementation, and contract terms.</li><li><strong className="text-foreground">3. Read critical feedback.</strong> Look for recurring limitations, not just the average score.</li><li><strong className="text-foreground">4. Validate with a demo.</strong> Test your real process before committing.</li></ol><Link to="/methodology" className="mono-label mt-7 inline-flex items-center gap-2 text-primary link-underline">Full methodology <ArrowRight className="h-3.5 w-3.5" /></Link></aside>
      </div>
    </>
  );
}
