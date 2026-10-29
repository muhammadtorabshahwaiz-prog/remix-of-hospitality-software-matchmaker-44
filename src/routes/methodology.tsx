import { createFileRoute } from "@tanstack/react-router";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/methodology")({
  head: () => ({ meta: [
    { title: "How Ratings Work \u2014 Hospitalityservis Methodology" },
    { name: "description", content: "How ratings are calculated and how we make money. Plain-language detail on scoring, verification and our business model." },
    { property: "og:title", content: "How Ratings Work \u2014 Hospitalityservis Methodology" },
    { property: "og:description", content: "How ratings are calculated and how we make money. Plain-language detail on scoring, verification and our business model." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["Scores", "Overall score averages four sub-scores \u2014 Ease of use, Value, Support and Features \u2014 from verified operator reviews, weighted toward recent reviews."], ["Verification", "Reviews come from operators we have spoken with or verified by business details. Reviews are published only with permission."], ["Rankings", "Best-of rankings combine scores, review volume, recency and our operator interviews. Paid placements are labeled and never change rank order."], ["How we make money", "Vendor subscriptions (Pro and Enterprise), referral commissions, agreed revenue shares and fees for qualified leads. Operators never pay for the initial conversation."], ["Our safeguard", "A positive review is never conditional on accepting an introduction, purchasing a service or giving a referral."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "Methodology" }]} eyebrow="Transparency" title="How ratings are calculated and how we make money.">{"Plain-language detail on scoring, verification and our business model."}</PageHead>
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {BLOCKS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05}><Card className="h-full p-6"><div className="font-mono text-xs text-primary">0{i + 1}</div><h2 className="mt-3 text-xl font-semibold">{t}</h2><p className="mt-2 text-muted-foreground">{d}</p></Card></Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
