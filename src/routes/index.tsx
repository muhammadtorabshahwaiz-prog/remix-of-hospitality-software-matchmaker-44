import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Truck, Landmark, PhoneCall, Megaphone, Wrench, Star, Search, Handshake, TrendingUp, ShieldCheck, ArrowRight, MessageSquare, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CountUp, HeroSquares, Marquee, MaskLine, Reveal, Scramble } from "@/components/fx";
import { Btn, CatIcon, Eyebrow, Logo, ProviderCard, Sample, Section, Stars, inputCls } from "@/components/site";
import { CATEGORIES, PROVIDERS, REVIEWS, getProvider } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hospitalityservis — Where hospitality connects, evaluates, and grows" },
      { name: "description", content: "The professional network and trusted marketplace for restaurants: honest reviews, provider comparisons, and qualified introductions." },
      { property: "og:title", content: "Hospitalityservis — The network behind hospitality" },
      { property: "og:description", content: "Restaurant operators find trusted POS, suppliers, financing, AI phone and marketing partners through real reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SERVICES = [
  { id: "pos", label: "POS & Payments", icon: CreditCard, stat: "Sample: avg. fee review 2.9% → 2.4%", desc: "Compare POS systems and payment processors on real fees, uptime and support. Operators share what they pay; we show where better-fit options exist." },
  { id: "sup", label: "Food Suppliers", icon: Truck, stat: "Local + national distributors", desc: "Rate distributors on pricing, consistency and delivery. Discover local suppliers that fit your menu and volume." },
  { id: "fin", label: "Restaurant Financing", icon: Landmark, stat: "Loans, advances, equipment lease", desc: "Understand financing options side by side — terms, speed and real borrower experiences before you sign." },
  { id: "ai", label: "AI Phone & Ordering", icon: PhoneCall, stat: "Missed calls → captured orders", desc: "Find AI phone, ordering and reservation tools that answer every call, take catering inquiries and reduce missed revenue." },
  { id: "mkt", label: "Marketing & Retention", icon: Megaphone, stat: "Loyalty, SMS, reviews, ads", desc: "See which marketing and loyalty services actually bring guests back, rated by operators like you." },
  { id: "eq", label: "Equipment & Maintenance", icon: Wrench, stat: "Repair, service, operations", desc: "Trusted local technicians and equipment partners, reviewed on response time and fair pricing." },
  { id: "rev", label: "Honest Reviews", icon: Star, stat: "Verified operators only", desc: "Every review comes from a real operator, published with permission. A review is never tied to buying anything." },
];
const STEPS = [
  ["Connect", "We talk with local restaurants and food trucks about how they run today."],
  ["Learn", "POS, payments, suppliers, phones, reservations, marketing and costs."],
  ["Review", "Operators share honest feedback — published only with permission."],
  ["Discover", "We identify providers that may offer better pricing, service or fit."],
  ["Introduce", "With consent, we arrange a quote, demo or comparison. No obligation."],
  ["Track", "We follow up to confirm the operator actually benefited."],
];

function ServiceMap() {
  const [active, setActive] = useState("pos");
  const cur = SERVICES.find((s) => s.id === active) ?? SERVICES[0]!;
  const W = 640, H = 480, cx = 590, cy = H / 2;
  const rows = SERVICES.map((s, i) => ({ ...s, y: 40 + i * ((H - 80) / (SERVICES.length - 1)), x: 220 + Math.abs(i - 3) * 50 }));
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {rows.map((r) => {
            const on = r.id === active;
            const d = `M ${r.x + 14} ${r.y} L ${cx - 120} ${r.y} C ${cx - 50} ${r.y}, ${cx - 70} ${cy}, ${cx - 30} ${cy}`;
            return (
              <g key={r.id}>
                <path d={d} fill="none" stroke="var(--primary)" strokeOpacity={on ? 1 : 0.25} strokeWidth={on ? 2 : 1.2} />
                {on && <path d={d} fill="none" stroke="var(--background)" strokeWidth={2.5} className="flow-line" />}
              </g>
            );
          })}
        </svg>
        {rows.map((r) => (
          <button key={r.id} onMouseEnter={() => setActive(r.id)} onFocus={() => setActive(r.id)} onClick={() => setActive(r.id)}
            className="group absolute flex -translate-x-full -translate-y-1/2 items-center gap-1.5 whitespace-nowrap sm:gap-2"
            style={{ left: `${((r.x + 14) / W) * 100}%`, top: `${(r.y / H) * 100}%` }}>
            <span className={`text-[10px] font-semibold transition-colors sm:text-sm md:text-base ${r.id === active ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{r.label}</span>
            <span className={`h-2 w-2 bg-primary transition-transform sm:h-3 sm:w-3 ${r.id === active ? "scale-150 shadow-[0_0_16px_var(--primary)]" : ""}`} />
          </button>
        ))}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(cx / W) * 100}%`, top: "50%" }}>
          <Logo className="h-10 w-10 text-sm shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_50%,transparent)] sm:h-16 sm:w-16 sm:text-xl" />
        </div>
      </div>
      <Card key={cur.id} className="p-8">
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <cur.icon className="h-8 w-8 text-primary" />
          <h3 className="mt-5 text-2xl font-semibold">{cur.label}</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{cur.desc}</p>
          <div className="mt-6 border-t border-border pt-4 font-mono text-xs uppercase tracking-wider text-primary">{cur.stat}</div>
        </motion.div>
      </Card>
    </div>
  );
}

function Index() {
  const [tab, setTab] = useState<"op" | "ven">("op");
  const [sent, setSent] = useState(false);
  const top = [...PROVIDERS].sort((a, b) => b.score - a.score).slice(0, 6);
  return (
    <>
      <section className="relative overflow-hidden">
        <HeroSquares />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 md:pt-28">
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 border border-border bg-card/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              <span className="h-2 w-2 animate-pulse bg-primary" /> The network behind hospitality
            </div>
          </Reveal>
          <h1 className="mt-8 text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            <MaskLine>Where hospitality</MaskLine>
            <MaskLine delay={0.1}>connects, evaluates</MaskLine>
            <MaskLine delay={0.2}>&amp; <Scramble /></MaskLine>
          </h1>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              The professional network and trusted marketplace for the restaurant industry — connecting operators with vetted providers through honest reviews, comparisons and qualified introductions.
            </p>
            <Link to="/categories" className="mx-auto mt-10 flex max-w-xl items-center border border-border bg-card p-1.5 text-left hover:border-primary">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <span className="flex-1 truncate px-3 py-2.5 text-sm text-muted-foreground">Search POS, suppliers, AI phone, financing…</span>
              <span className="bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Search</span>
            </Link>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-px border border-border bg-border">
            {[[12000, "+", "Operator reviews", ""], [640, "", "Vetted providers", ""], [0, "", "Cost to operators", "$"]].map(([n, s, l, p]) => (
              <div key={l as string} className="bg-background p-4 sm:p-5">
                <div className="font-mono text-2xl font-bold text-primary sm:text-3xl"><CountUp to={n as number} suffix={s as string} prefix={p as string} /></div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-3"><Sample /></div>
        </div>
      </section>

      <Marquee items={CATEGORIES.map((c) => c.name)} />

      <Section>
        <Reveal><Eyebrow>01 / The network</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Everything a restaurant runs on — reviewed and connected.</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">Hover each category to see what we offer.</p></Reveal>
        <div className="mt-14"><ServiceMap /></div>
      </Section>

      <Section className="pt-0">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div><Eyebrow>02 / Featured categories</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Browse the network</h2></div>
          <Btn to="/categories" variant="ghost">All categories <ArrowRight className="h-4 w-4" /></Btn>
        </Reveal>
        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((c) => (
            <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="group bg-background p-6 transition-colors hover:bg-accent">
              <CatIcon name={c.icon} className="h-6 w-6 text-primary" />
              <div className="mt-4 font-semibold group-hover:text-primary">{c.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.blurb}</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Reveal><Eyebrow>03 / Signals from the field</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Highest-rated restaurant tech</h2></Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{top.map((p) => <ProviderCard key={p.slug} p={p} />)}</div>
      </Section>

      <Section className="pt-0">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div><Eyebrow>04 / Latest reviews</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">From operators</h2></div>
          <Btn to="/reviews" variant="ghost">All reviews <ArrowRight className="h-4 w-4" /></Btn>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {REVIEWS.slice(0, 3).map((r) => (
            <Card key={r.id} tilt className="p-6">
              <div className="flex items-center justify-between"><Stars value={r.rating} /><Sample /></div>
              <div className="mt-4 font-semibold">{r.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
              <div className="mt-5 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{r.author} · {r.business} · {getProvider(r.provider)?.name}</div>
            </Card>
          ))}
        </div>
      </Section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal><Eyebrow>05 / How it works</Eyebrow><h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">A useful conversation, not a sales pitch.</h2></Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.05} className="bg-background p-8 transition-colors hover:bg-accent">
                <div className="font-mono text-sm text-primary">0{i + 1}</div>
                <h3 className="mt-4 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </Reveal>
            ))}
          </div>
          <div className="brackets mt-10 flex items-start gap-4 border border-primary/40 bg-accent p-6">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm"><span className="font-semibold text-primary">Our integrity promise:</span> a review is never conditional on accepting an introduction, buying a service or giving a referral. Commercial relationships are always disclosed, and nothing is published or shared without consent.</p>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>06 / Two sides, one network</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Built for operators and providers.</h2>
            <div className="mt-8 inline-flex border border-border p-1">
              {([["op", "Operators"], ["ven", "Vendors"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`px-5 py-2 text-sm font-semibold ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
            <div className="mt-8"><Btn to="/for-vendors">Vendor plans <ArrowRight className="h-4 w-4" /></Btn></div>
          </Reveal>
          <ul className="space-y-4">
            {(tab === "op"
              ? [[MessageSquare, "Honest peer reviews", "Real experiences from restaurants and food trucks."], [Search, "Side-by-side comparisons", "Fees, features and support in one view."], [TrendingUp, "Save on operating costs", "Introductions to better-fit options — always free, never obligated."], [Handshake, "Trusted local partners", "A vetted network in your own market."]]
              : [[Star, "Build credibility", "Verified profiles, ratings and reviews."], [Handshake, "Qualified introductions", "Demos, quotes and consultations with real operators."], [TrendingUp, "Pay for results", "Revenue share and cost-per-qualified-lead models."], [Megaphone, "Featured placements", "Subscription slots across categories and landing pages."]]
            ).map(([I, t, d]) => {
              const Icon = I as typeof Star;
              return (
                <li key={t as string}><Card className="flex gap-4 p-5"><div className="flex gap-4"><Icon className="h-6 w-6 shrink-0 text-primary" /><div><div className="font-semibold">{t as string}</div><div className="text-sm text-muted-foreground">{d as string}</div></div></div></Card></li>
              );
            })}
          </ul>
        </div>
      </Section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <Eyebrow>07 / Join</Eyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Better connections. Better hospitality.</h2>
        <p className="mt-4 text-muted-foreground">Share your experience or list your business. We'll be in touch.</p>
        {sent ? (
          <div className="mt-10 flex items-center justify-center gap-2 border border-primary bg-accent p-6 text-primary"><Check className="h-5 w-5" /> Thanks — we'll reach out shortly.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-10 grid gap-3 text-left sm:grid-cols-2">
            <input required placeholder="Your name" className={inputCls} />
            <input required type="email" placeholder="Email" className={inputCls} />
            <input placeholder="Business name" className={inputCls} />
            <select className={inputCls}><option>I'm a restaurant operator</option><option>I'm a provider / vendor</option></select>
            <div className="sm:col-span-2"><Btn type="submit" className="w-full">Join the network</Btn></div>
          </form>
        )}
      </section>
    </>
  );
}
