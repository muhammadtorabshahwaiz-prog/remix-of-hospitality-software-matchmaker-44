import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({ links: [canonical("/about")], meta: [
    { title: "About Hospitalityservis" },
    { name: "description", content: "Hospitalityservis is a software review and discovery network: honest user reviews, comparisons and qualified introductions across every category." },
    { property: "og:title", content: "About Hospitalityservis" },
    { property: "og:description", content: "Hospitalityservis is a software review and discovery network: honest user reviews, comparisons and qualified introductions across every category." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["Why we exist", "Buyers deserve honest information about the software they rely on. Vendors deserve a fair way to reach buyers who actually need them."], ["Two sides, one network", "Buyers find the right products through honest reviews and comparisons. Vendors build credibility and reach qualified customers."], ["Every kind of software", "We cover CRM, support, HR, security, AI, e-commerce and more, with hospitality as one of our specialist categories."], ["Honesty over sales", "Sometimes the right outcome is confirming a buyer already has a good solution. That honesty is what makes the platform credible."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "About" }]} eyebrow="Our story" title="Software reviews you can trust.">{"Hospitalityservis is the professional network and trusted marketplace for software buyers and vendors."}</PageHead>
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {BLOCKS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05}><Card className="h-full p-8"><div className="font-mono text-xs text-primary">0{i + 1}</div><h2 className="mt-3 text-xl font-semibold">{t}</h2><p className="mt-2 text-muted-foreground">{d}</p></Card></Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
