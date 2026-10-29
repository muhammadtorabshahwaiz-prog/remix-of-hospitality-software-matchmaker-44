import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { useEffect, useState } from "react";
import { Card } from "@/components/fx";
import { Btn, Empty, PageHead, Sample, Section, SkeletonCards, Stars, inputCls } from "@/components/site";
import { CATEGORIES, REVIEWS, getProvider } from "@/data/site";

export const Route = createFileRoute("/reviews")({
  head: () => ({ links: [canonical("/reviews")], meta: [
    { title: "Restaurant Software Reviews from Operators — Hospitalityservis" },
    { name: "description", content: "Honest reviews of POS, payments, AI phone, suppliers and more from restaurant and food truck operators." },
    { property: "og:title", content: "Operator Reviews — Hospitalityservis" },
    { property: "og:description", content: "Honest reviews from restaurant operators." },
  ] }),
  component: Page,
});

function Page() {
  const [cat, setCat] = useState("all");
  const [min, setMin] = useState(0);
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);
  const list = REVIEWS.filter((r) => {
    const p = getProvider(r.provider)!;
    return (cat === "all" || p.category === cat) && r.rating >= min && (r.title + r.body + p.name).toLowerCase().includes(q.toLowerCase());
  });
  return (
    <>
      <PageHead crumbs={[{ label: "Reviews" }]} eyebrow="Signals from the field" title="All reviews">Every review is from an operator and published with permission. <Sample /></PageHead>
      <Section>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reviews..." className={inputCls} />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} sm:w-64`}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          <select value={min} onChange={(e) => setMin(+e.target.value)} className={`${inputCls} sm:w-44`}><option value={0}>Any rating</option><option value={4}>4+</option><option value={5}>5</option></select>
        </div>
        <div className="mt-8">
          {!ready ? <SkeletonCards n={6} /> : list.length === 0 ? <Empty title="No reviews match">Try clearing a filter.</Empty> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => { const p = getProvider(r.provider)!; return (
                <Card key={r.id} tilt className="p-6">
                  <div className="flex items-center justify-between"><Stars value={r.rating} /><Link to="/software/$slug" params={{ slug: p.slug }} className="font-mono text-[11px] uppercase text-primary">{p.name}</Link></div>
                  <div className="mt-3 font-semibold">{r.title}</div><p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                  <div className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{r.author} · {r.business} · {r.date}</div>
                </Card>
              ); })}
            </div>
          )}
        </div>
        <div className="mt-10"><Btn to="/write-review">Write a review</Btn></div>
      </Section>
    </>
  );
}
