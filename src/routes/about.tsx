import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({ links: [canonical("/about")], meta: [
    { title: "About Hospitalityservis" },
    { name: "description", content: "The network behind hospitality. Hospitalityservis is the professional network and trusted marketplace for the restaurant industry." },
    { property: "og:title", content: "About Hospitalityservis" },
    { property: "og:description", content: "The network behind hospitality. Hospitalityservis is the professional network and trusted marketplace for the restaurant industry." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["Why we exist", "Restaurant operators deserve honest information about the tools and partners they rely on. Vendors deserve a fair way to reach operators who actually need them."], ["Two sides, one network", "Operators find reliable providers, honest reviews and comparisons. Vendors build credibility and reach qualified restaurant customers."], ["Local first", "We start in defined local markets, building relationships with restaurants and food trucks and a track record of useful introductions."], ["Honesty over sales", "Sometimes the right outcome is confirming an operator already has a good solution. That honesty is what makes the platform credible."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "About" }]} eyebrow="Our story" title="The network behind hospitality.">{"Hospitalityservis is the professional network and trusted marketplace for the restaurant industry."}</PageHead>
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
