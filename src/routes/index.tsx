import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Card, CountUp, HeroSquares, Marquee, MaskLine, Reveal, Scramble } from "@/components/fx";
import { Btn, CatIcon, Eyebrow, ProviderCard, Sample, Section, Stars, inputCls } from "@/components/site";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { CATEGORIES, PROVIDERS, getCategory, providersIn, reviewsFor } from "@/data/site";
import { submitLead } from "@/lib/submit";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [canonical("/")],
    meta: [
      { title: "Hospitalityservis — Software reviews, comparisons and introductions" },
      { name: "description", content: "Find the right software with honest user reviews, side-by-side comparisons and qualified introductions across CRM, support, HR, security, AI, e-commerce and more." },
      { property: "og:title", content: "Hospitalityservis — Find software with honest reviews" },
      { property: "og:description", content: "Compare software across every category using real user reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURED = ["crm", "project-management", "customer-support", "hr-software", "cybersecurity", "accounting", "ai-phone-answering", "ecommerce-platforms"];
const POPULAR = ["crm", "project-management", "customer-support", "cybersecurity", "ai-phone-answering", "accounting"];
const STEPS = [
  ["01", "Search and compare", "Filter any category by rating, price tier, region and features, then compare up to three products side by side."],
  ["02", "Read honest reviews", "Reviews are moderated and published with the reviewer's permission. Paid placements are always labeled."],
  ["03", "Get an introduction", "Ask for a demo or quote. Your details are shared only if you give consent, and it is always free for buyers."],
] as const;

function openSearch() {
  try { window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true })); } catch { /* ignore */ }
}

function Index() {
  const top = FEATURED.slice(0, 6).map((slug) => [...providersIn(slug)].sort((a, b) => b.score - a.score)[0]!).filter(Boolean);
  const reviews = top.slice(0, 3).map((p) => ({ p, r: reviewsFor(p.slug)[0]! })).filter((x) => x.r);
  const join = useSubmit((fd) => submitLead({
    type: str(fd, "role") === "vendor" ? "vendor_join" : "operator_join", name: str(fd, "name"), email: str(fd, "email"),
    restaurant: str(fd, "business"), consent: bool(fd, "consent"), consent_text: "I agree to be contacted by Hospitalityservis about joining the network.", company_url: str(fd, "company_url"),
  }));
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <HeroSquares />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 text-center sm:px-6 md:pb-36 md:pt-36">
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 border border-primary/40 bg-card/70 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse bg-primary" /> Software reviews you can trust
            </div>
          </Reveal>
          <h1 className="mt-10 text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl">
            <MaskLine>Where software</MaskLine>
            <MaskLine delay={0.1}>connects, evaluates</MaskLine>
            <MaskLine delay={0.2}>&amp; <Scramble /></MaskLine>
          </h1>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Honest reviews, side-by-side comparisons and qualified introductions for every kind of software, from CRM and security to AI and hospitality.
            </p>
            <button type="button" onClick={openSearch} className="mx-auto mt-12 flex w-full max-w-2xl items-center border border-border bg-card p-2 text-left transition-colors hover:border-primary">
              <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate px-4 py-3 text-base text-muted-foreground">Search CRM, support, HR, security, AI…</span>
              <span className="bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">Search</span>
            </button>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Popular</span>
              {POPULAR.map((slug) => (
                <Link key={slug} to="/categories/$slug" params={{ slug }} className="border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">{getCategory(slug)?.name}</Link>
              ))}
            </div>
          </Reveal>
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-px border border-border bg-border">
            {([[CATEGORIES.length, "Categories", ""], [PROVIDERS.length, "Sample products", ""], [0, "Cost to buyers", "$"]] as const).map(([n, l, pre]) => (
              <div key={l} className="bg-background p-6 sm:p-8">
                <div className="font-mono text-3xl font-bold text-primary sm:text-4xl"><CountUp to={n} prefix={pre} /></div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4"><Sample /></div>
        </div>
      </section>

      <Marquee items={CATEGORIES.map((c) => c.name)} />

      {/* CATEGORIES */}
      <Section>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Browse</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Software by category</h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{CATEGORIES.length} categories and growing. Pick one to compare products.</p>
          </div>
          <Btn to="/categories" variant="ghost">All categories <ArrowRight className="h-4 w-4" /></Btn>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((slug, i) => {
            const c = getCategory(slug)!;
            return (
              <Reveal key={slug} delay={i * 0.04}>
                <Link to="/categories/$slug" params={{ slug }} className="group block h-full">
                  <Card className="h-full p-8">
                    <CatIcon name={c.icon} className="h-8 w-8 text-primary" />
                    <div className="mt-6 text-xl font-semibold group-hover:text-primary">{c.name}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
                    <div className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{providersIn(slug).length} products</div>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* TOP RATED */}
      <Section className="pt-0">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3"><Eyebrow>Top rated</Eyebrow><Sample /></div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Leaders by category</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{top.map((p) => <ProviderCard key={p.slug} p={p} />)}</div>
      </Section>

      {/* REVIEWS */}
      <Section className="pt-0">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3"><Eyebrow>Reviews</Eyebrow><Sample /></div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">From real users</h2>
          </div>
          <Btn to="/reviews" variant="ghost">All reviews <ArrowRight className="h-4 w-4" /></Btn>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {reviews.map(({ p, r }) => (
            <Card key={r.id} tilt className="p-8">
              <div className="flex items-center justify-between"><Stars value={r.rating} /><Link to="/software/$slug" params={{ slug: p.slug }} className="font-mono text-[11px] uppercase tracking-wider text-primary">{p.name}</Link></div>
              <div className="mt-5 text-lg font-semibold">{r.title}</div>
              <p className="mt-2 text-muted-foreground">{r.body}</p>
              <div className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{r.author} · {r.role}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">A useful conversation, not a sales pitch.</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {STEPS.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="font-mono text-6xl font-bold text-primary">{n}</div>
                <h3 className="mt-6 text-2xl font-semibold">{t}</h3>
                <p className="mt-3 text-muted-foreground">{d}</p>
              </Reveal>
            ))}
          </div>
          <div className="brackets mt-20 flex gap-5 border border-primary/40 bg-accent p-8">
            <ShieldCheck className="h-7 w-7 shrink-0 text-primary" />
            <p className="text-muted-foreground"><span className="font-semibold text-primary">Our integrity promise.</span> A review is never conditional on accepting an introduction, buying a product or giving a referral. Commercial relationships are always disclosed, and nothing is published or shared without consent.</p>
          </div>
        </div>
      </section>

      {/* TWO SIDES */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-10">
            <Eyebrow>For buyers</Eyebrow>
            <h3 className="mt-4 text-3xl font-bold">Choose with confidence</h3>
            <p className="mt-4 text-muted-foreground">Compare products on real user ratings, see what they cost, and ask for a demo only when you are ready. Free, with no obligation.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Btn to="/categories">Browse software</Btn><Btn to="/write-review" variant="ghost">Write a review</Btn></div>
          </Card>
          <Card className="p-10">
            <Eyebrow>For vendors</Eyebrow>
            <h3 className="mt-4 text-3xl font-bold">Reach buyers who are comparing</h3>
            <p className="mt-4 text-muted-foreground">Claim your profile, collect verified reviews and receive qualified leads. Sponsored slots are always labeled and never change ratings.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Btn to="/for-vendors">See vendor plans</Btn></div>
          </Card>
        </div>
      </Section>

      {/* JOIN */}
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-4 text-center sm:px-6 md:pb-36">
        <Eyebrow>Join</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Better connections. Better software.</h2>
        <p className="mt-5 text-lg text-muted-foreground">Share your experience or list your product. We'll be in touch.</p>
        {join.sent ? (
          <div className="mt-12 text-left"><Sent mode={join.sent}>Thanks. We'll reach out shortly.</Sent></div>
        ) : (
          <form onSubmit={join.onSubmit} noValidate className="relative mt-12 grid gap-5 text-left sm:grid-cols-2">
            <Honeypot />
            <input name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
            <input name="email" required type="email" maxLength={255} placeholder="Email" className={inputCls} />
            <input name="business" maxLength={120} placeholder="Company" className={inputCls} />
            <select name="role" className={inputCls}><option value="operator">I'm a software buyer</option><option value="vendor">I'm a vendor</option></select>
            <label className="flex items-start gap-3 text-sm text-muted-foreground sm:col-span-2"><input name="consent" type="checkbox" className="mt-1 accent-[var(--primary)]" />I agree to be contacted by Hospitalityservis about joining the network.</label>
            <div className="sm:col-span-2"><FormError message={join.err} /></div>
            <div className="sm:col-span-2"><Btn type="submit" className="w-full">{join.busy ? "Sending..." : "Join the network"}</Btn></div>
          </form>
        )}
      </section>
    </>
  );
}
