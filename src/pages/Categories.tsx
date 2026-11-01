import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, Search } from "lucide-react";
import { CatIcon, EmptyState, PageHeader } from "@/components/marketplace";
import { CATEGORIES, GROUPS, categoriesInGroup, providersIn } from "@/data/site";
import { usePageTitle } from "@/lib/seo";

export default function Categories() {
  usePageTitle("All software categories", "Browse software categories across sales, support, productivity, finance, IT, AI, commerce, and hospitality.");
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const activeQuery = params.get("q")?.toLowerCase().trim() || "";
  const groups = useMemo(() => GROUPS.map((group) => ({ group, categories: categoriesInGroup(group).filter((category) => !activeQuery || `${category.name} ${category.blurb} ${group}`.toLowerCase().includes(activeQuery)) })).filter((entry) => entry.categories.length), [activeQuery]);
  const count = groups.reduce((total, entry) => total + entry.categories.length, 0);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <>
      <PageHeader eyebrow="The complete index" title={<>Software, organized<br />around your decision.</>} breadcrumbs={[{ label: "Categories" }]}>
        <p>{CATEGORIES.length} categories across seven business areas. Choose a category to compare features, pricing tiers, regions, and sample ratings.</p>
        <form onSubmit={submit} className="mt-7 flex" role="search">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-11" placeholder="Filter categories" aria-label="Filter categories" /></div>
          <button type="submit" className="btn-primary">Filter</button>
        </form>
      </PageHeader>
      <div className="site-container py-16 sm:py-24">
        <div className="mono-label mb-8 flex justify-between text-muted-foreground"><span>{count} categories shown</span>{activeQuery && <button type="button" onClick={() => { setQuery(""); setParams({}); }} className="text-primary">Clear filter</button>}</div>
        {!groups.length ? <EmptyState title="No categories match">Try a broader term such as CRM, finance, support, or hospitality.</EmptyState> : groups.map(({ group, categories }) => (
          <section key={group} className="mb-16 grid gap-8 border-t border-border pt-8 lg:grid-cols-12">
            <div className="lg:col-span-3"><h2 className="font-display text-2xl font-extrabold">{group}</h2><p className="mono-label mt-2 text-muted-foreground">{categories.length} categories</p></div>
            <div className="grid gap-x-8 sm:grid-cols-2 lg:col-span-9">
              {categories.map((category) => (
                <Link key={category.slug} to={`/categories/${category.slug}`} className="group flex items-start gap-4 border-b border-border py-6">
                  <CatIcon name={category.icon} className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span className="flex-1"><span className="block font-display text-xl font-bold group-hover:text-primary">{category.name}</span><span className="mt-1 block text-sm text-muted-foreground">{category.blurb}</span><span className="mono-label mt-3 block text-muted-foreground">{providersIn(category.slug).length} sample products</span></span>
                  <ArrowRight className="mt-1 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
