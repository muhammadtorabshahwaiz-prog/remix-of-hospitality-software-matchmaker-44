import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Reveal } from "@/components/fx";
import { CatIcon, Empty, PageHead, Section, inputCls } from "@/components/site";
import { CATEGORIES, GROUPS, providersIn } from "@/data/site";

export const Route = createFileRoute("/categories/")({
  head: () => ({ links: [canonical("/categories")], meta: [
    { title: "Software Categories — Hospitalityservis" },
    { name: "description", content: "Browse software categories: CRM, project management, support, HR, accounting, security, AI, e-commerce and more, reviewed by real users." },
    { property: "og:title", content: "Software Categories — Hospitalityservis" },
    { property: "og:description", content: "Every kind of software, reviewed by real users." },
  ] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const list = CATEGORIES.filter((c) => (c.name + c.blurb).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead crumbs={[{ label: "Categories" }]} eyebrow="Directory" title="All categories">Every kind of software, reviewed by the people who use it.</PageHead>
      <Section>
        <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter categories..." className={`${inputCls} pl-10`} /></div>
        <div className="mt-8">
          {list.length === 0 ? <Empty title="No categories match">Try a shorter search like "crm" or "pay".</Empty> : (
            <div className="space-y-16">
              {GROUPS.map((g) => {
                const items = list.filter((c) => c.group === g);
                if (items.length === 0) return null;
                return (
                  <div key={g}>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-primary">{g}</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((c, i) => (
                        <Reveal key={c.slug} delay={i * 0.03}>
                          <Link to="/categories/$slug" params={{ slug: c.slug }} className="block h-full">
                            <Card className="h-full p-8">
                              <CatIcon name={c.icon} className="h-7 w-7 text-primary" />
                              <div className="mt-5 text-lg font-semibold">{c.name}</div>
                              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                              <div className="mt-5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{providersIn(c.slug).length} products</div>
                            </Card>
                          </Link>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
