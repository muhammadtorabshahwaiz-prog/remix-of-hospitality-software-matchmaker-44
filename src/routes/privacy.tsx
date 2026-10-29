import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Card, Reveal } from "@/components/fx";
import { PageHead, Section } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({ links: [canonical("/privacy")], meta: [
    { title: "Privacy Policy \u2014 Hospitalityservis" },
    { name: "description", content: "Placeholder policy \u2014 have counsel review before launch." },
    { property: "og:title", content: "Privacy Policy \u2014 Hospitalityservis" },
    { property: "og:description", content: "Placeholder policy \u2014 have counsel review before launch." },
  ] }),
  component: Page,
});

const BLOCKS: [string, string][] = [["What we collect", "Contact details you submit, review content and basic usage analytics."], ["How we use it", "To publish reviews you approve, respond to inquiries and, with your consent, introduce you to providers."], ["Sharing", "We share your contact details with a provider only after you ask for an introduction, demo or quote."], ["Your choices", "Ask us to edit or delete your information at any time via the contact page."]];

function Page() {
  return (
    <>
      <PageHead crumbs={[{ label: "Privacy" }]} eyebrow="Legal" title="Privacy policy">{"Placeholder policy \u2014 have counsel review before launch."}</PageHead>
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
