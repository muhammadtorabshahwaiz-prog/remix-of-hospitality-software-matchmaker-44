import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/disclosure")({
  head: () => ({ links: [canonical("/disclosure")], meta: [
    { title: "Advertiser & Partner Disclosure \u2014 Hospitalityservis" },
    { name: "description", content: "Commercial relationships, disclosed. How partner relationships work on Hospitalityservis." },
    { property: "og:title", content: "Advertiser & Partner Disclosure \u2014 Hospitalityservis" },
    { property: "og:description", content: "Commercial relationships, disclosed. How partner relationships work on Hospitalityservis." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["Partner compensation", "Some providers pay us referral fees, revenue share or per-lead fees when an operator chooses to connect with them."], ["Editorial independence", "Compensation never affects review content or scores. Sponsored placements are clearly labeled."], ["Financing", "We are not a lender. Financing terms vary by provider and business."], ["Sample data", "Some ratings, providers and reviews shown are sample placeholders, labeled \u201cSample\u201d, until real data is collected."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "Disclosure" }]} eyebrow="Disclosure" title="Commercial relationships, disclosed.">{"How partner relationships work on Hospitalityservis."}</PageHead>
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
