import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Reveal } from "@/components/fx";
import { CatIcon, Empty, PageHead, Section, inputCls } from "@/components/site";
import { CATEGORIES, providersIn } from "@/data/site";

export const Route = createFileRoute("/categories/")({
  head: () => ({ meta: [
    { title: "Restaurant Software Categories — Hospitalityservis" },
    { name: "description", content: "Browse every restaurant software and service category: POS, payments, AI phone, funding, reservations, suppliers and more." },
    { property: "og:title", content: "Restaurant Software Categories — Hospitalityservis" },
    { property: "og:description", content: "Every category restaurants run on, reviewed by operators." },
  ] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const list = CATEGORIES.filter((c) => (c.name + c.blurb).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead crumbs={[{ label: "Categories" }]} eyebrow="Directory" title="All categories">Everything a restaurant runs on, reviewed by operators.</PageHead>
      <Section>
        <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter categories..." className={`${inputCls} pl-10`} /></div>
        <div className="mt-8">
          {list.length === 0 ? <Empty title="No categories match">Try a shorter search like "pay" or "phone".</Empty> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c, i) => (
                <Reveal key={c.slug} delay={i * 0.03}>
                  <Link to="/categories/$slug" params={{ slug: c.slug }} className="block h-full">
                    <Card className="h-full p-6">
                      <CatIcon name={c.icon} className="h-7 w-7 text-primary" />
                      <div className="mt-5 text-lg font-semibold">{c.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                      <div className="mt-5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{providersIn(c.slug).length} providers</div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
