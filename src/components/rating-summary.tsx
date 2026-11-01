import { Link } from "react-router";
import { Stars } from "@/components/marketplace";
import { trpc } from "@/providers/trpc";

const CATS: [string, string][] = [["ease", "Ease of use"], ["value", "Value"], ["support", "Support"], ["features", "Features"]];

/** Real community score, worked out from approved reviews (see Methodology). Shows nothing until a product has real reviews. */
export function RatingSummary({ providerSlug }: { providerSlug: string }) {
  const q = trpc.marketplace.ratingSummary.useQuery({ providerSlug }, { retry: false });
  const d = q.data;
  if (!d || !d.count || d.score === null) return null;
  const max = Math.max(...d.distribution, 1);
  return (
    <section aria-label="Community rating" className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-display text-4xl font-black">{d.score.toFixed(1)}</span>
        <div><Stars value={d.score} /><p className="mt-1 text-sm text-muted-foreground">Community score from {d.count} approved {d.count === 1 ? "review" : "reviews"} ({d.verified} verified). Plain average {d.average?.toFixed(1)}. <Link to="/methodology" className="text-primary underline">How this is worked out</Link></p></div>
      </div>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <ul className="space-y-1.5" aria-label="Reviews by star rating">
          {[5, 4, 3, 2, 1].map((n) => (
            <li key={n} className="flex items-center gap-3 text-xs"><span className="w-10">{n} star</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(d.distribution[n - 1]! / max) * 100}%` }} /></span>
              <span className="w-6 text-right text-muted-foreground">{d.distribution[n - 1]}</span></li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {CATS.map(([k, label]) => <div key={k}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-semibold">{d.categories[k] ?? "n/a"}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}
