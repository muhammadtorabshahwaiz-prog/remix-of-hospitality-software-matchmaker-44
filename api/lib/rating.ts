export type RatingRow = {
  rating: number; ease: number; value: number; support: number; features: number;
  createdAt: Date; verifiedAt: Date | null; incentivized: boolean; helpfulCount: number;
};

// How the community score is made (also explained on the Methodology page):
//  - every approved review counts, newer ones count more (half-life about 18 months, never below 25%)
//  - verified reviewers count 25% more; reviews with a disclosed incentive count 40% less
//  - reviews other buyers found helpful count a little more (up to +50%)
//  - the result is pulled slightly toward 3.8 with 3 "pseudo-reviews", so a single 5-star review cannot top a product with hundreds
const HALF_LIFE_DAYS = 540;
const PRIOR = 3.8;
const PRIOR_WEIGHT = 3;

export function weightOf(r: RatingRow, now = Date.now()): number {
  const ageDays = Math.max(0, (now - r.createdAt.getTime()) / 86_400_000);
  const recency = Math.max(0.25, Math.pow(0.5, ageDays / HALF_LIFE_DAYS));
  return recency * (r.verifiedAt ? 1.25 : 1) * (r.incentivized ? 0.6 : 1) * (1 + Math.min(r.helpfulCount, 10) * 0.05);
}

export function summarize(rows: RatingRow[]) {
  const count = rows.length;
  const distribution = [0, 0, 0, 0, 0];
  let sumW = 0, sumWR = 0, sum = 0, verified = 0;
  const cat = { ease: [0, 0], value: [0, 0], support: [0, 0], features: [0, 0] } as Record<string, [number, number]>;
  for (const r of rows) {
    const w = weightOf(r);
    sumW += w; sumWR += w * r.rating; sum += r.rating;
    if (r.verifiedAt) verified++;
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    for (const k of Object.keys(cat)) { const v = (r as Record<string, unknown>)[k] as number; if (v > 0) { cat[k]![0] += v; cat[k]![1]++; } }
  }
  const score = count ? (PRIOR * PRIOR_WEIGHT + sumWR) / (PRIOR_WEIGHT + sumW) : null;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    count,
    verified,
    score: score === null ? null : round1(score),
    average: count ? round1(sum / count) : null,
    distribution,
    categories: Object.fromEntries(Object.entries(cat).map(([k, [t, n]]) => [k, n ? round1(t / n) : null])) as Record<string, number | null>,
  };
}
