import type React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CreditCard, Truck, Landmark, PhoneCall, Megaphone, Wrench, Star, Search, Handshake,
  TrendingUp, ShieldCheck, ArrowRight, MessageSquare, Check,
} from "lucide-react";

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
  { id: "pos", label: "POS & Payments", icon: CreditCard, stat: "Avg. fee review: 2.9% → 2.4%", desc: "Compare POS systems and payment processors on real fees, uptime and support. Operators share what they pay; we show where better-fit options exist." },
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

const TOP = [
  { name: "Toast", cat: "POS", score: 4.6, n: 1284 },
  { name: "Square for Restaurants", cat: "POS", score: 4.5, n: 2210 },
  { name: "Slang.ai", cat: "AI Phone", score: 4.7, n: 312 },
  { name: "Sysco", cat: "Supplier", score: 4.1, n: 940 },
  { name: "OpenTable", cat: "Reservations", score: 4.3, n: 1650 },
  { name: "Thanx", cat: "Loyalty", score: 4.4, n: 288 },
];

function Logo({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={`grid place-items-center rounded-2xl bg-primary text-primary-foreground font-bold ${className}`}>
      <span className="font-mono">hs</span>
    </div>
  );
}

function ServiceMap() {
  const [active, setActive] = useState("pos");
  const cur = SERVICES.find((s) => s.id === active) ?? SERVICES[0]!;
  const W = 640, H = 480, cx = 590, cy = H / 2;
  const rows = SERVICES.map((s, i) => ({ ...s, y: 40 + i * ((H - 80) / (SERVICES.length - 1)), x: 220 + (Math.abs(i - 3) * 50) }));
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
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
          <button
            key={r.id}
            onMouseEnter={() => setActive(r.id)}
            onFocus={() => setActive(r.id)}
            onClick={() => setActive(r.id)}
            className="absolute -translate-y-1/2 flex items-center gap-2 -translate-x-full whitespace-nowrap group"
            style={{ left: `${((r.x + 14) / W) * 100}%`, top: `${(r.y / H) * 100}%` }}
          >
            <span className={`text-sm md:text-base font-semibold transition-colors ${r.id === active ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{r.label}</span>
            <span className={`h-3 w-3 rounded-full bg-primary transition-transform ${r.id === active ? "scale-150 shadow-[0_0_16px_var(--primary)]" : ""}`} />
          </button>
        ))}
        <Logo className="absolute h-14 w-14 md:h-16 md:w-16 -translate-y-1/2 -translate-x-1/2 text-xl shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_50%,transparent)]" style={{ left: `${(cx / W) * 100}%`, top: "50%" }} />
      </div>
      <div key={cur.id} className="rounded-xl border border-border bg-card p-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <cur.icon className="h-8 w-8 text-primary" />
        <h3 className="mt-5 text-2xl font-semibold">{cur.label}</h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">{cur.desc}</p>
        <div className="mt-6 font-mono text-xs uppercase tracking-wider text-primary border-t border-border pt-4">{cur.stat}</div>
      </div>
    </div>
  );
}

function Index() {
  const [tab, setTab] = useState<"op" | "ven">("op");
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 h-16">
          <a href="#top" className="flex items-center gap-3"><Logo className="h-9 w-9 text-sm" /><span className="font-semibold tracking-tight">Hospitalityservis</span></a>
          <nav className="hidden md:flex gap-8 text-sm text-muted-foreground">
            {[["Network", "#network"], ["How it works", "#how"], ["Top rated", "#top-rated"], ["For vendors", "#join"]].map(([l, h]) => (
              <a key={h} href={h} className="hover:text-primary transition-colors">{l}</a>
            ))}
          </nav>
          <a href="#join" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Join the network</a>
        </div>
      </header>

      <section id="top" className="relative">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-20 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> The network behind hospitality
          </div>
          <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
            Where hospitality<br /><span className="text-primary">connects, evaluates</span> & grows.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The professional network and trusted marketplace for the restaurant industry — connecting operators with vetted providers through honest reviews, comparisons and qualified introductions.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); document.getElementById("top-rated")?.scrollIntoView({ behavior: "smooth" }); }} className="mx-auto mt-10 flex max-w-xl items-center rounded-lg border border-border bg-card p-1.5 focus-within:border-primary">
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <input placeholder="Search POS, suppliers, AI phone, financing…" className="flex-1 bg-transparent px-3 py-2.5 outline-none placeholder:text-muted-foreground" />
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Search</button>
          </form>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[["12k+", "Operator reviews"], ["640", "Vetted providers"], ["$0", "Cost to operators"]].map(([n, l]) => (
              <div key={l} className="bg-background p-5"><div className="text-3xl font-bold text-primary">{n}</div><div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="network" className="mx-auto max-w-7xl px-5 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">01 / The network</p>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">Everything a restaurant runs on — reviewed and connected.</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">Hover each category to see what we offer.</p>
        <div className="mt-14"><ServiceMap /></div>
      </section>

      <section id="how" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">02 / How it works</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">A useful conversation, not a sales pitch.</h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <div key={t} className="group bg-background p-8 transition-colors hover:bg-accent">
                <div className="font-mono text-sm text-primary">0{i + 1}</div>
                <h3 className="mt-4 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-start gap-4 rounded-xl border border-primary/40 bg-accent p-6">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm text-accent-foreground/90"><span className="font-semibold text-primary">Our integrity promise:</span> a review is never conditional on accepting an introduction, buying a service or giving a referral. Commercial relationships are always disclosed, and nothing is published or shared without consent.</p>
          </div>
        </div>
      </section>

      <section id="top-rated" className="mx-auto max-w-7xl px-5 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">03 / Signals from the field</p>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Highest-rated restaurant tech</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOP.map((p) => (
            <div key={p.name} className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{p.cat}</span>
                <span className="flex items-center gap-1 text-primary font-semibold"><Star className="h-4 w-4 fill-current" />{p.score}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{p.name}</h3>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(p.score / 5) * 100}%` }} /></div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{p.n.toLocaleString()} reviews</span>
                <span className="flex items-center gap-1 text-foreground group-hover:text-primary">Compare <ArrowRight className="h-4 w-4" /></span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Sample data for preview.</p>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-24 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">04 / Two sides, one network</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Built for operators and providers.</h2>
            <div className="mt-8 inline-flex rounded-lg border border-border p-1">
              {([["op", "Operators"], ["ven", "Vendors"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-md px-5 py-2 text-sm font-semibold ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
          </div>
          <ul className="space-y-4">
            {(tab === "op"
              ? [[MessageSquare, "Honest peer reviews", "Real experiences from restaurants and food trucks."], [Search, "Side-by-side comparisons", "Fees, features and support in one view."], [TrendingUp, "Save on operating costs", "Introductions to better-fit options — always free, never obligated."], [Handshake, "Trusted local partners", "A vetted network in your own market."]]
              : [[Star, "Build credibility", "Verified profiles, ratings and reviews."], [Handshake, "Qualified introductions", "Demos, quotes and consultations with real operators."], [TrendingUp, "Pay for results", "Revenue share and cost-per-qualified-lead models."], [Megaphone, "Featured placements", "Subscription slots across categories and landing pages."]]
            ).map(([I, t, d]) => {
              const Icon = I as typeof Star;
              return (
                <li key={t as string} className="flex gap-4 rounded-xl border border-border bg-background p-5">
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                  <div><div className="font-semibold">{t as string}</div><div className="text-sm text-muted-foreground">{d as string}</div></div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="join" className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">05 / Join</p>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Better connections. Better hospitality.</h2>
        <p className="mt-4 text-muted-foreground">Share your experience or list your business. We'll be in touch.</p>
        {sent ? (
          <div className="mt-10 flex items-center justify-center gap-2 rounded-xl border border-primary bg-accent p-6 text-primary"><Check className="h-5 w-5" /> Thanks — we'll reach out shortly.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-10 grid gap-3 text-left sm:grid-cols-2">
            <input required placeholder="Your name" className="rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
            <input required type="email" placeholder="Email" className="rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
            <input placeholder="Business name" className="rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
            <select className="rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary">
              <option>I'm a restaurant operator</option><option>I'm a provider / vendor</option>
            </select>
            <button className="sm:col-span-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">Join the network</button>
          </form>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3"><Logo className="h-7 w-7 text-xs" /> © 2026 Hospitalityservis</div>
          <p className="font-mono text-xs">Reviews reflect genuine experiences. Commercial relationships disclosed.</p>
        </div>
      </footer>
    </div>
  );
}
