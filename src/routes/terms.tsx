import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/terms")({
  head: () => ({ links: [canonical("/terms")], meta: [
    { title: "Terms of Use \u2014 Hospitalityservis" },
    { name: "description", content: "Placeholder terms \u2014 have counsel review before launch." },
    { property: "og:title", content: "Terms of Use \u2014 Hospitalityservis" },
    { property: "og:description", content: "Placeholder terms \u2014 have counsel review before launch." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["Using the site", "Information is provided for general guidance. Confirm pricing and terms directly with providers."], ["Reviews", "By submitting a review you confirm it reflects your genuine experience and grant us permission to publish it."], ["Vendors", "Vendor listings must be accurate. We may remove misleading content."], ["Liability", "Hospitalityservis is not responsible for decisions made based on content on this site."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "Terms" }]} eyebrow="Legal" title="Terms of use">{"Placeholder terms \u2014 have counsel review before launch."}</PageHead>
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
