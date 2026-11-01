import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Check, Search, ShieldCheck } from "lucide-react";
import { CoreStage } from "@/components/core-stage";
import { CatIcon, LineWipe, ProviderRow, ReviewCard, SampleBadge, sampleToDisplay } from "@/components/marketplace";
import { CATEGORIES, GROUPS, PROVIDERS, REVIEWS, categoriesInGroup, getCategory, providersIn } from "@/data/site";
import { usePageTitle } from "@/lib/seo";

const popular = ["crm", "project-management", "customer-support", "ai-phone-answering", "cybersecurity", "pos-systems"];

export default function Home() {
  usePageTitle("Software decisions, made clearer", "Compare software across 30 categories with practical filters, review pages, and side-by-side comparisons.");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const leaders = ["crm", "project-management", "customer-support", "ai-phone-answering", "cybersecurity", "pos-systems"]
    .map((slug) => [...providersIn(slug)].sort((a, b) => b.score - a.score)[0]!).filter(Boolean);

  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/categories${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="site-container grid min-h-[calc(100dvh-72px)] gap-12 py-14 lg:grid-cols-12 lg:items-center lg:py-20">
          <div className="relative z-10 lg:col-span-7">
            <p className="mono-label flex items-center gap-3 text-primary"><span className="h-2.5 w-2.5 rounded-full bg-primary" style={{ boxShadow: "0 0 0 4px oklch(var(--primary) / .18)" }} />The software decision index</p>
            <h1 className="display-xl mt-8 max-w-5xl">Find software<br />that <span className="text-primary">earns</span><br />its place.</h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-muted-foreground">Compare products across every kind of software. Practical filters, detailed review pages, and introductions only when you ask.</p>
            <form onSubmit={search} className="mt-10 flex max-w-2xl flex-col gap-2 sm:flex-row" role="search">
              <label className="sr-only" htmlFor="hero-search">Search software categories</label>
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input id="hero-search" value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-12" placeholder="Try CRM, support, AI voice, POS…" /></div>
              <button type="submit" className="btn-primary sm:px-8">Search index <ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {popular.slice(0, 4).map((slug) => <Link key={slug} to={`/categories/${slug}`} className="link-underline text-muted-foreground hover:text-primary">{getCategory(slug)?.name}</Link>)}
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="slab" data-no-tilt>
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><span className="mono-label">Live directory preview</span><SampleBadge /></div>
              {leaders.slice(0, 4).map((provider, index) => (
                <Link to={`/software/${provider.slug}`} key={provider.slug} className="data-row grid grid-cols-[28px_1fr_auto] items-center gap-3 px-5 py-5">
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <span><span className="block font-display font-bold">{provider.name}</span><span className="text-sm text-muted-foreground">{getCategory(provider.category)?.name}</span></span>
                  <span className="font-mono text-sm text-primary">{provider.score.toFixed(1)}</span>
                </Link>
              ))}
              <Link to="/categories" className="flex min-h-14 items-center justify-between px-5 font-mono text-[11px] uppercase tracking-wider text-primary hover:bg-card">Open the full index <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="site-container grid grid-cols-3 gap-4 py-10 sm:gap-8 sm:py-14">
          {[[CATEGORIES.length, "Software categories"], [PROVIDERS.length, "Sample product profiles"], [0, "Cost to buyers"]].map(([number, label]) => (
            <div key={label} className="slab px-3 py-8 sm:px-8 sm:py-10">
              <p className="font-display text-4xl font-extrabold sm:text-6xl">{number}</p>
              <p className="mono-label mt-3 text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <CoreStage />

      <section className="site-container py-24 sm:py-32">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8"><p className="mono-label text-primary">Browse the index</p><h2 className="display-lg mt-5">Every category.<br />One clear view.</h2></div>
          <p className="max-w-md text-lg text-muted-foreground lg:col-span-4">From CRM and cybersecurity to restaurant POS and funding. Start broad, then narrow by fit.</p>
        </div>
        <div className="mt-16 border-t border-border">
          {GROUPS.map((group, groupIndex) => (
            <div key={group} className="grid gap-5 border-b border-border py-8 lg:grid-cols-12">
              <div className="flex gap-4 lg:col-span-4"><span className="font-mono text-xs text-primary">0{groupIndex + 1}</span><h3 className="font-display text-2xl font-bold">{group}</h3></div>
              <div className="flex flex-wrap gap-x-7 gap-y-4 lg:col-span-8">
                {categoriesInGroup(group).map((category) => <Link key={category.slug} to={`/categories/${category.slug}`} className="group inline-flex items-center gap-2 text-lg text-muted-foreground hover:text-primary"><CatIcon name={category.icon} className="h-4 w-4" /><span className="link-underline">{category.name}</span></Link>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="site-container py-24 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><div className="flex items-center gap-3"><p className="mono-label text-primary">Category leaders</p><SampleBadge /></div><h2 className="display-md mt-4">A starting point, not a pay-to-play list.</h2></div>
            <Link to="/categories" className="btn-secondary">All software <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-14">{leaders.map((provider, index) => <ProviderRow key={provider.slug} provider={provider} rank={index + 1} />)}</div>
        </div>
      </section>

      <section className="site-container py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4"><div className="flex items-center gap-3"><p className="mono-label text-primary">Review format</p><SampleBadge /></div><h2 className="display-md mt-4">Specific feedback beats a score alone.</h2><p className="mt-5 text-muted-foreground">These sample reviews demonstrate the publishing format. New submissions remain private until moderated.</p><Link to="/write-review" className="btn-primary mt-7">Share your experience</Link></div>
          <div className="lg:col-span-8 lg:pl-6">{REVIEWS.slice(0, 3).map((review) => <ReviewCard key={review.id} review={sampleToDisplay(review)} showProvider />)}</div>
        </div>
      </section>

      <LineWipe />
      <section className="paper-section">
        <div className="site-container py-24 sm:py-32">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7"><p className="mono-label">Review integrity</p><h2 className="display-lg mt-5">Trust is the product.</h2></div>
            <p className="max-w-lg text-xl lg:col-span-5">A useful marketplace has to show its workings: where reviews come from, how rankings are made, and who pays for what.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              [ShieldCheck, "Moderated before publication", "New reviews start pending. Verification is shown only when it has actually happened."],
              [Check, "Consent before introductions", "Your contact details are never sent to a provider unless you explicitly ask for that introduction."],
              [Search, "Payment never buys a rating", "Sponsored placements are labeled and kept separate from organic rating order."],
            ].map(([Icon, title, copy]) => {
              const IconComponent = Icon as typeof ShieldCheck;
              return <div key={String(title)} className="slab px-6 py-8"><IconComponent className="h-6 w-6" /><h3 className="mt-5 font-display text-xl font-bold">{String(title)}</h3><p className="mt-3 text-muted-foreground">{String(copy)}</p></div>;
            })}
          </div>
          <Link to="/methodology" className="btn-secondary mt-12">Read our methodology <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
