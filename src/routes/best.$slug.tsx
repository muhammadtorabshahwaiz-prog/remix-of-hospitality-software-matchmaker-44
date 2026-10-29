import { canonical } from "@/lib/seo";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Empty, PageHead, ProviderCard, Sample, Section } from "@/components/site";
import { BEST, providersIn } from "@/data/site";

export const Route = createFileRoute("/best/$slug")({
  loader: ({ params }) => { const b = BEST.find((x) => x.slug === params.slug); if (!b) throw notFound(); return b; },
  head: ({ loaderData }) => ({ links: loaderData ? [canonical(`/best/${loaderData.slug}`)] : [], meta: loaderData ? [
    { title: `${loaderData.title} (2026) — Hospitalityservis` },
    { name: "description", content: loaderData.lead },
    { property: "og:title", content: `${loaderData.title} — Hospitalityservis` },
    { property: "og:description", content: loaderData.lead },
    { property: "og:type", content: "article" },
  ] : [{ title: "Ranking not found" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => <Section><Empty title="Ranking not found"><Link to="/categories" className="text-primary">Browse categories</Link></Empty></Section>,
  errorComponent: () => <Section><Empty title="Something went wrong" /></Section>,
  component: Page,
});

function Page() {
  const b = Route.useLoaderData();
  const list = [...providersIn(b.category)].sort((x, y) => y.score - x.score);
  return (
    <>
      <PageHead crumbs={[{ label: "Best of" }, { label: b.title }]} eyebrow="2026 ranking" title={b.title}>{b.lead} <Sample /></PageHead>
      <Section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <ProviderCard key={p.slug} p={p} rank={i + 1} />)}</div>
      </Section>
      <Section className="pt-0">
        <div className="brackets border border-border bg-card p-8">
          <h2 className="text-2xl font-bold">Methodology</h2>
          <p className="mt-3 text-muted-foreground">Rankings combine operator review scores (ease, value, support, features), review volume and recency, and our own interviews with operators. Paid placements are labeled and never change rank order.</p>
          <Link to="/methodology" className="mt-4 inline-block text-sm text-primary">Full methodology</Link>
        </div>
      </Section>
    </>
  );
}
