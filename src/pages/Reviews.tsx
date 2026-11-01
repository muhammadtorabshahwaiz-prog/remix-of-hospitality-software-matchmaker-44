import { useMemo, useState } from "react";
import { Link } from "react-router";
import { EmptyState, PageHeader, ReviewCard, SampleBadge, sampleToDisplay, type DisplayReview } from "@/components/marketplace";
import { REVIEWS, getProvider } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

export default function Reviews() {
  usePageTitle("Software reviews", "Read moderated user reviews and preview the review publishing format across the software catalog.");
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(0);
  const approved = trpc.marketplace.approvedReviews.useQuery({ limit: 100 }, { retry: false });
  const reviews = useMemo<DisplayReview[]>(() => {
    const live: DisplayReview[] = (approved.data || []).map((review) => ({ id: review.id, provider: review.providerSlug, author: review.reviewerName, role: review.reviewerRole, business: review.business, rating: review.rating, title: review.title, body: review.body, date: new Date(review.createdAt).toLocaleDateString(), verified: Boolean(review.verifiedAt), incentivized: review.incentivized, vendorResponse: review.vendorResponse, live: true, helpful: review.helpfulCount }));
    return [...live, ...REVIEWS.map(sampleToDisplay)].filter((review) => {
      const provider = getProvider(review.provider);
      const haystack = `${review.title} ${review.body} ${review.author} ${provider?.name || ""}`.toLowerCase();
      return review.rating >= rating && haystack.includes(query.toLowerCase().trim());
    });
  }, [approved.data, query, rating]);

  return (
    <>
      <PageHeader eyebrow="Review library" title={<>Useful detail.<br />Clearly labeled.</>} breadcrumbs={[{ label: "Reviews" }]}>
        <p>Moderated submissions appear first, followed by clearly labeled sample reviews that demonstrate the publishing format.</p>
        <div className="mt-5"><SampleBadge /></div>
      </PageHeader>
      <div className="site-container py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside><div className="lg:sticky lg:top-24"><h2 className="mono-label">Filter the library</h2><label className="mt-6 block text-sm font-semibold">Search reviews<input value={query} onChange={(event) => setQuery(event.target.value)} className="field mt-2" placeholder="Product, topic, reviewer…" /></label><label className="mt-5 block text-sm font-semibold">Minimum rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="field mt-2"><option value={0}>Any rating</option><option value={4}>4 & up</option><option value={5}>5 only</option></select></label><Link to="/write-review" className="btn-primary mt-7 w-full">Write a review</Link><p className="mt-5 text-sm text-muted-foreground">Reviews are never conditional on a purchase, introduction, or referral.</p></div></aside>
          <section><p className="mono-label border-b border-border pb-5 text-muted-foreground">{reviews.length} reviews shown</p>{reviews.length ? reviews.slice(0, 80).map((review) => <ReviewCard key={review.id} review={review} showProvider />) : <div className="mt-8"><EmptyState title="No reviews match">Try clearing the search or choosing a broader rating filter.</EmptyState></div>}</section>
        </div>
      </div>
    </>
  );
}
