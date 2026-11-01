import { RatingSummary } from "@/components/rating-summary";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, BadgeCheck, Check, Code2, Globe2, Minus, ShieldCheck } from "lucide-react";
import { Breadcrumbs, CompareButton, EmptyState, LeadDialog, ProviderRow, ReviewCard, SampleBadge, SaveButton, Stars, sampleToDisplay } from "@/components/marketplace";
import type { DisplayReview } from "@/components/marketplace";
import { getCategory, getProvider, providersIn, reviewsFor } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";
import NotFound from "./NotFound";

function ScoreBreakdown({ label, value }: { label: string; value: number }) {
  return <div className="grid grid-cols-[100px_1fr_32px] items-center gap-3"><span className="text-sm text-muted-foreground">{label}</span><div className="h-1.5 bg-secondary"><div className="h-full bg-primary" style={{ width: `${value / 5 * 100}%` }} /></div><span className="font-mono text-xs">{value.toFixed(1)}</span></div>;
}

export default function Software() {
  const { slug = "" } = useParams();
  const provider = getProvider(slug);
  usePageTitle(provider?.name || "Product not found", provider ? `${provider.name} overview, sample ratings, features, pricing tier, alternatives, and reviews.` : undefined);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("newest");
  const approved = trpc.marketplace.approvedReviews.useQuery({ providerSlug: slug, limit: 100 }, { enabled: Boolean(provider), retry: false });

  const reviews = useMemo<DisplayReview[]>(() => {
    if (!provider) return [];
    const live: DisplayReview[] = (approved.data || []).map((review) => ({
      id: review.id,
      provider: review.providerSlug,
      author: review.reviewerName,
      role: review.reviewerRole,
      business: review.business,
      rating: review.rating,
      title: review.title,
      body: review.body,
      date: new Date(review.createdAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
      verified: Boolean(review.verifiedAt),
      incentivized: review.incentivized,
      vendorResponse: review.vendorResponse,
      live: true,
      helpful: review.helpfulCount,
    }));
    return [...live, ...reviewsFor(provider.slug).map(sampleToDisplay)]
      .filter((review) => review.rating >= rating)
      .sort((a, b) => sort === "highest" ? b.rating - a.rating : sort === "lowest" ? a.rating - b.rating : String(b.date).localeCompare(String(a.date)));
  }, [provider, approved.data, rating, sort]);

  if (!provider) return <NotFound />;
  const category = getCategory(provider.category);
  const alternatives = providersIn(provider.category).filter((item) => item.slug !== provider.slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-border">
        <div className="site-container pb-14 pt-8 sm:pb-20 sm:pt-10">
          <Breadcrumbs items={[{ label: "Categories", to: "/categories" }, { label: category?.name || "Software", to: `/categories/${provider.category}` }, { label: provider.name }]} />
          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3"><Link to={`/categories/${provider.category}`} className="mono-label text-primary link-underline">{category?.name}</Link><SampleBadge />{provider.claimed && <span className="mono-label inline-flex items-center gap-1 text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary" />Claimed</span>}</div>
              <h1 className="display-lg mt-5">{provider.name}</h1>
              <p className="mt-6 max-w-3xl text-xl text-muted-foreground">{provider.tagline}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4"><Stars value={provider.score} /><span className="text-sm text-muted-foreground">{provider.reviews.toLocaleString()} sample reviews</span></div>
              <RatingSummary providerSlug={provider.slug} />
            </div>
            <aside className="border-t border-border pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="mono-label text-muted-foreground">Pricing summary</p><p className="mt-3 font-display text-2xl font-bold">{provider.priceLabel}</p><p className="mt-2 text-sm text-muted-foreground">Illustrative tier only. Confirm current pricing and contract terms with the vendor.</p>
              <LeadDialog provider={provider}><button type="button" className="btn-primary mt-6 w-full">Request demo or quote <ArrowRight className="h-4 w-4" /></button></LeadDialog>
              <div className="mt-3 flex flex-wrap gap-2"><CompareButton providerSlug={provider.slug} /><SaveButton providerSlug={provider.slug} /></div>
            </aside>
          </div>
        </div>
      </section>

      <div className="site-container py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <section>
              <p className="mono-label text-primary">Overview</p><h2 className="display-md mt-4">What to evaluate.</h2>
              <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{provider.tagline} Use this profile as a preview of the evaluation format, then validate fit, pricing, security, and support for your own team.</p>
              <div className="mt-8 grid gap-x-10 gap-y-4 border-t border-border pt-6 sm:grid-cols-2">{provider.featureList.map((feature) => <div key={feature} className="flex items-center gap-3 border-b border-border pb-4"><Check className="h-4 w-4 text-primary" /><span>{feature}</span></div>)}</div>
            </section>
            <section className="grid gap-8 sm:grid-cols-2">
              <div><h3 className="font-display text-xl font-bold">Sample pros</h3><ul className="mt-5 space-y-4">{provider.pros.map((item) => <li key={item} className="flex gap-3 text-muted-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></div>
              <div><h3 className="font-display text-xl font-bold">Sample considerations</h3><ul className="mt-5 space-y-4">{provider.cons.map((item) => <li key={item} className="flex gap-3 text-muted-foreground"><Minus className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></div>
            </section>
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono-label text-primary">User feedback</p><h2 className="display-md mt-4">Reviews.</h2></div><Link to={`/write-review?product=${provider.slug}`} className="btn-secondary">Write a review</Link></div>
              <div className="mt-8 flex flex-wrap gap-4 border-y border-border py-5">
                <label className="text-sm">Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="ml-2 border border-border bg-background px-3 py-2"><option value={0}>All</option><option value={4}>4 & up</option><option value={5}>5 only</option></select></label>
                <label className="text-sm">Sort<select value={sort} onChange={(event) => setSort(event.target.value)} className="ml-2 border border-border bg-background px-3 py-2"><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label>
              </div>
              {reviews.length ? reviews.map((review) => <ReviewCard key={review.id} review={review} />) : <div className="mt-8"><EmptyState title="No reviews match">Try another rating filter or be the first to submit feedback for moderation.</EmptyState></div>}
            </section>
          </div>
          <aside className="space-y-12 lg:col-span-4">
            <section className="border-t border-border pt-6"><h2 className="font-display text-xl font-bold">Sample rating breakdown</h2><div className="mt-6 space-y-4"><ScoreBreakdown label="Ease of use" value={provider.ease} /><ScoreBreakdown label="Value" value={provider.value} /><ScoreBreakdown label="Support" value={provider.support} /><ScoreBreakdown label="Features" value={provider.features} /></div></section>
            <section className="border-t border-border pt-6"><h2 className="font-display text-xl font-bold">Product details</h2><dl className="mt-5 space-y-4 text-sm">{[["Best fit", `${provider.companySize} business`], ["Regions", provider.countries.join(", ")], ["Contract", provider.contract], ["Hardware", provider.hardware ? "Required / offered" : "No special hardware"]].map(([term, detail]) => <div key={term} className="flex justify-between gap-5 border-b border-border pb-3"><dt className="text-muted-foreground">{term}</dt><dd className="text-right">{detail}</dd></div>)}</dl></section>
            <section className="border-t border-border pt-6"><h2 className="font-display text-xl font-bold">Trust & ownership</h2><div className="mt-5 space-y-4 text-sm text-muted-foreground"><p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />New reviews are pending until moderated.</p><p className="flex gap-3"><Globe2 className="h-5 w-5 shrink-0 text-primary" />Introductions happen only with your consent.</p><p className="flex gap-3"><Code2 className="h-5 w-5 shrink-0 text-primary" /><Link to={`/embed/${provider.slug}`} className="link-underline hover:text-primary">Preview embeddable profile badge</Link></p></div><Link to={`/vendor?claim=${provider.slug}`} className="mono-label mt-6 inline-block text-primary link-underline">Claim this profile</Link></section>
          </aside>
        </div>
      </div>

      <section className="border-t border-border bg-card/40"><div className="site-container py-20"><p className="mono-label text-primary">Alternatives</p><h2 className="display-md mb-10 mt-4">Compare before you decide.</h2><div className="border-t border-border">{alternatives.map((alternative) => <ProviderRow key={alternative.slug} provider={alternative} />)}</div></div></section>
    </>
  );
}
