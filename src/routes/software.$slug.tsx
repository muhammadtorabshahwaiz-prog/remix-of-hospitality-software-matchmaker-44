import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, BadgeCheck, CircleDashed } from "lucide-react";
import { Card, Reveal, ScoreBar } from "@/components/fx";
import { Btn, Crumbs, Empty, Logo, ProviderCard, Sample, Section, Stars, compareStore, useCompare, inputCls } from "@/components/site";
import { getCategory, getProvider, providersIn, reviewsFor } from "@/data/site";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { AffiliateNote, EmbedBadge, SponsoredBadge } from "@/components/trust";
import { submitLead } from "@/lib/submit";
import { breadcrumbLd, canonical, jsonLd, softwareLd } from "@/lib/seo";

export const Route = createFileRoute("/software/$slug")({
  loader: ({ params }) => { const p = getProvider(params.slug); if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => ({
    links: loaderData ? [canonical(`/software/${loaderData.slug}`)] : [],
    scripts: loaderData ? [
      jsonLd(softwareLd(loaderData, reviewsFor(loaderData.slug))),
      jsonLd(breadcrumbLd([{ name: "Home", path: "/" }, { name: "Categories", path: "/categories" }, { name: getCategory(loaderData.category)?.name ?? "Category", path: `/categories/${loaderData.category}` }, { name: loaderData.name, path: `/software/${loaderData.slug}` }])),
    ] : [],
    meta: loaderData ? [
    { title: `${loaderData.name} Reviews, Pricing & Alternatives — Hospitalityservis` },
    { name: "description", content: `${loaderData.name}: ${loaderData.tagline} Ratings, pros and cons from restaurant operators.` },
    { property: "og:title", content: `${loaderData.name} Reviews — Hospitalityservis` },
    { property: "og:description", content: loaderData.tagline },
    { property: "og:type", content: "product" },
  ] : [{ title: "Provider not found" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => <Section><Empty title="Provider not found"><Link to="/categories" className="text-primary">Browse categories</Link></Empty></Section>,
  errorComponent: () => <Section><Empty title="Something went wrong loading this provider" /></Section>,
  component: Page,
});

function Page() {
  const p = Route.useLoaderData();
  const cat = getCategory(p.category)!;
  const sel = useCompare();
  const [minStars, setMinStars] = useState(0);
  const [askOpen, setAskOpen] = useState(false);
  const reviews = reviewsFor(p.slug).filter((r) => r.rating >= minStars);
  const alts = providersIn(p.category).filter((x) => x.slug !== p.slug);
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Crumbs items={[{ label: "Categories", to: "/categories" }, { label: cat.name, to: "/categories/$slug", params: { slug: cat.slug } }, { label: p.name }]} />
          <Reveal className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Logo className="h-16 w-16 text-xl sm:h-20 sm:w-20" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold sm:text-5xl">{p.name}</h1>
                  {p.claimed
                    ? <span className="inline-flex items-center gap-1 border border-primary/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary"><BadgeCheck className="h-3 w-3" />Claimed</span>
                    : <span className="inline-flex items-center gap-1 border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><CircleDashed className="h-3 w-3" />Unclaimed</span>}
                  <Sample />
                  {p.sponsored && <SponsoredBadge />}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><Stars value={p.score} /> {p.reviews.toLocaleString()} reviews · {cat.name}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={() => setAskOpen(true)}>Request Demo / Get Quote</Btn>
              <Btn variant="ghost" onClick={() => compareStore.toggle(p.slug)}>{sel.includes(p.slug) ? "Remove from compare" : "Add to compare"}</Btn>
            </div>
          </Reveal>
        </div>
      </section>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <div><h2 className="text-2xl font-bold">Overview</h2><p className="mt-3 text-muted-foreground">{p.tagline} Available in {p.countries.join(" and ")}. {p.hardware ? "Hardware available." : "Software only."} Best suited to {p.companySize.toLowerCase()} operations.</p></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="brackets relative aspect-video border border-border bg-card grid-bg"><span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase text-muted-foreground">Screenshot {i}</span></div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5"><div className="font-semibold">Pros</div><ul className="mt-3 space-y-2 text-sm">{p.pros.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{x}</li>)}</ul></Card>
              <Card className="p-5"><div className="font-semibold">Cons</div><ul className="mt-3 space-y-2 text-sm">{p.cons.map((x) => <li key={x} className="flex gap-2"><Minus className="h-4 w-4 text-muted-foreground" />{x}</li>)}</ul></Card>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <select value={minStars} onChange={(e) => setMinStars(+e.target.value)} className={`${inputCls} w-auto py-2`}><option value={0}>All ratings</option><option value={4}>4+ stars</option><option value={5}>5 stars</option></select>
              </div>
              <div className="mt-5 space-y-4">
                {reviews.length === 0 ? <Empty title="No reviews match this filter" /> : reviews.map((r) => (
                  <Card key={r.id} className="p-5">
                    <div className="flex items-center justify-between"><Stars value={r.rating} /><span className="font-mono text-[11px] text-muted-foreground">{r.date}</span></div>
                    <div className="mt-3 font-semibold">{r.title}</div><p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                    <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{r.author} · {r.role} · {r.business}</div>
                  </Card>
                ))}
              </div>
              <div className="mt-5"><Btn to="/write-review" variant="ghost">Write a review</Btn></div>
            </div>
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Rating breakdown</div>
              <div className="mt-4 space-y-4">{([["Ease of use", p.ease], ["Value", p.value], ["Support", p.support], ["Features", p.features]] as const).map(([l, v]) => (
                <div key={l}><div className="mb-1.5 flex justify-between text-sm"><span>{l}</span><span className="font-mono text-primary">{v.toFixed(1)}</span></div><ScoreBar value={v} /></div>
              ))}</div>
            </Card>
            <Card className="p-5">
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Pricing summary</div>
              <div className="mt-3 font-mono text-2xl text-primary">{p.priceLabel}</div>
              <div className="mt-2 text-sm text-muted-foreground">{p.contract} · Pricing varies by setup; confirm with the provider.</div>
            </Card>
            {p.claimed && <EmbedBadge slug={p.slug} name={p.name} />}
            <AffiliateNote />
          </aside>
        </div>
      </Section>
      {alts.length > 0 && (
        <Section className="pt-0">
          <h2 className="text-2xl font-bold">Alternatives to {p.name}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{alts.map((a) => <ProviderCard key={a.slug} p={a} />)}</div>
        </Section>
      )}
      <DemoDialog open={askOpen} onOpenChange={setAskOpen} provider={p.name} />
    </>
  );
}

function DemoDialog({ open, onOpenChange, provider }: { open: boolean; onOpenChange: (v: boolean) => void; provider: string }) {
  const consentText = `I agree to share my details with ${provider} so they can contact me about a demo or quote.`;
  const { busy, sent, err, onSubmit } = useSubmit((fd) => submitLead({
    type: "demo", product: provider, name: str(fd, "name"), email: str(fd, "email"), restaurant: str(fd, "restaurant"),
    phone: str(fd, "phone"), city: str(fd, "city"), notes: str(fd, "notes"),
    consent: bool(fd, "consent"), consent_text: consentText, company_url: str(fd, "company_url"),
  }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a demo or quote from {provider}</DialogTitle>
          <DialogDescription>Free for operators, no obligation. Your details are shared only if you tick the consent box.</DialogDescription>
        </DialogHeader>
        {sent ? <Sent mode={sent}>Request received for {provider}.</Sent> : (
          <form onSubmit={onSubmit} noValidate className="relative grid gap-3">
            <Honeypot />
            <input name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
            <input name="restaurant" maxLength={120} placeholder="Restaurant or business" className={inputCls} />
            <input name="email" required type="email" maxLength={255} placeholder="Email" className={inputCls} />
            <input name="phone" type="tel" maxLength={40} placeholder="Phone (optional)" className={inputCls} />
            <input name="city" maxLength={120} placeholder="City, State" className={inputCls} />
            <textarea name="notes" rows={3} maxLength={2000} placeholder="What do you need help with?" className={inputCls} />
            <label className="flex items-start gap-2 text-sm text-muted-foreground"><input name="consent" type="checkbox" className="mt-1 accent-[var(--primary)]" />{consentText}</label>
            <FormError message={err} />
            <div><Btn type="submit">{busy ? "Sending..." : "Send request"}</Btn></div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
