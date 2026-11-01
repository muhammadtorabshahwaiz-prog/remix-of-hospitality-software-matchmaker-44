import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { createCore, type CoreCategory, type CoreConfig } from "@/lib/core-engine";
import { SampleBadge } from "@/components/marketplace";
import { CATEGORIES, getCategory, getProvider, providersIn, reviewsFor } from "@/data/site";
import { THEMES, advanceTheme, getMode, getThemeIndex, getVisual, subscribeTheme } from "@/lib/theme";

type Panel = { type: "cat" | "prov"; slug: string } | { type: "list" | "all" } | null;

const SERVICES: [string, string, string][] = [
  ["Software categories", "Browse every restaurant and hospitality software category.", "/categories"],
  ["Compare", "Put up to three products side by side.", "/compare"],
  ["Reviews", "Read operator reviews, clearly labelled as sample.", "/reviews"],
  ["Write a review", "Share your own experience with a product.", "/write-review"],
  ["Financing", "Funding options explained before you sign.", "/financing"],
  ["For vendors", "Claim a profile and respond to reviews.", "/for-vendors"],
  ["Methodology", "How scores are made.", "/methodology"],
  ["Disclosure", "How the site is funded.", "/disclosure"],
  ["About", "Who is behind Hospitalityservis.", "/about"],
  ["Contact", "Ask a question or request an introduction.", "/contact"],
];

const GLYPHS: Record<string, string> = {
  "pos-systems": "▦", payments: "◈", "funding-loans": "⬡", reservations: "◷", "online-ordering": "➤",
  "marketing-loyalty": "✦", "food-suppliers": "❖", "inventory-back-office": "⬢", "payroll-scheduling": "◉", "delivery-management": "✚",
};

const hash = (text: string) => { let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const NODE_COLORS = ["#67E8F9", "#7DD3FC", "#5EEAD4", "#A7F3D0", "#F9A8D4", "#FDE68A"];

function buildCategories(): CoreCategory[] {
  // Every one of the 30 software categories is a layer of the nucleus.
  return CATEGORIES.map((category) => ({
    slug: category.slug,
    name: category.name,
    glyph: GLYPHS[category.slug] ?? category.name.charAt(0).toUpperCase(),
    blurb: category.blurb,
    providers: [...providersIn(category.slug)].sort((a, b) => b.score - a.score).slice(0, 4).map((provider) => {
      const reviews = reviewsFor(provider.slug);
      return {
        slug: provider.slug, name: provider.name, col: NODE_COLORS[hash(provider.name) % NODE_COLORS.length]!,
        rate: provider.score.toFixed(1), cnt: provider.reviews,
        quote: reviews[0]?.title ?? provider.tagline, quote2: reviews[1]?.title ?? provider.tagline,
      };
    }),
  })).filter((category) => category.providers.length >= 1);
}

export function CoreStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof createCore> | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [state, setState] = useState<{ hint: boolean; released: number; paused?: boolean }>({ hint: true, released: 0 });
  const categories = useMemo(buildCategories, []);
  const mode = useSyncExternalStore(subscribeTheme, getMode, () => "dark" as const);

  useEffect(() => {
    if (!canvasRef.current || !tipRef.current) return;
    const config: CoreConfig = {
      categories,
      onCategory: (slug) => setPanel({ type: "cat", slug }),
      onProvider: (slug) => setPanel({ type: "prov", slug }),
      onState: setState,
      onCore: (kind) => setPanel({ type: kind === "single" ? "list" : "all" }),
      // A discharge returns straight to the homepage hero: no dark screen or status dialogue.
      // The blast moves the whole site to its next theme: new accent colour, and light <-> dark.
      onBlast: () => advanceTheme(),
      getTheme: () => getThemeIndex() % THEMES.length,
      getHue: () => getVisual().hsl,
      isLight: () => getMode() === "light",
      onBlank: () => {
        setPanel(null);
        window.scrollTo({ top: 0, behavior: "auto" });
      },
    };
    const instance = createCore(canvasRef.current, tipRef.current, config);
    engine.current = instance;
    return () => { instance.destroy(); engine.current = null; };
  }, [categories]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section aria-labelledby="core-title" className="slab-stage relative mx-auto my-4 h-[calc(100dvh-96px)] min-h-[640px] w-[calc(100%-2rem)] max-w-[1440px] overflow-hidden rounded-[2rem] border border-border bg-[#070b10] sm:my-6">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-pan-y" style={{ filter: mode === "light" ? "invert(1) hue-rotate(180deg) saturate(1.35) contrast(1.12)" : "none", transition: "filter 1.6s ease" }} aria-hidden="true" />
      <div ref={tipRef} className="pointer-events-none absolute z-10 max-w-[240px] slab-tag bg-background px-3 py-2 text-xs leading-relaxed opacity-0 transition-opacity [&_b]:font-mono [&_i]:mt-1 [&_i]:block [&_i]:not-italic [&_i]:text-muted-foreground" />

      <div className="pointer-events-none absolute left-4 top-24 z-10 max-w-sm sm:left-8 lg:left-12">
        <h2 id="core-title" className="sr-only">The network core</h2>
        <p className="mono-label flex items-center gap-2 text-primary"><span className="block h-2.5 w-2.5 rounded-full bg-primary" />AI software network</p>
      </div>
      <div className="absolute right-4 top-24 z-10 flex gap-2 sm:right-8 lg:right-12">
        <button type="button" onClick={() => engine.current?.zoomBy(1 / 1.35)} aria-label="Zoom map out" className="btn-secondary !px-3"><Minus className="h-4 w-4" /></button>
        <button type="button" onClick={() => engine.current?.zoomBy(1.35)} aria-label="Zoom map in" className="btn-secondary !px-3"><Plus className="h-4 w-4" /></button>
      </div>
      {state.paused && <p className="pointer-events-none absolute inset-x-0 bottom-8 z-10 px-4 text-center text-xs text-muted-foreground">Paused. Hover any dial to see what it is. Double-click empty space to resume.</p>}
      {state.released > 0 && <p className="pointer-events-none absolute bottom-8 left-4 z-10 text-xs text-muted-foreground sm:left-8 lg:left-12">Profiles released this session: {state.released}</p>}

      <nav className="sr-only" aria-label="Hospitality categories">
        {categories.map((category) => <Link key={category.slug} to={`/categories/${category.slug}`}>{category.name}</Link>)}
      </nav>

      {panel && (
        <aside role="dialog" aria-label="Details" className="absolute inset-y-0 right-0 z-20 w-full overflow-y-auto border-l border-border bg-background p-6 sm:w-[420px]" style={{ boxShadow: "-18px 0 40px -18px rgb(0 0 0 / .45)" }}>
          <button type="button" onClick={() => setPanel(null)} aria-label="Close" className="float-right p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          {panel.type === "list" ? <DepartmentsPanel categories={categories} onPick={(slug) => setPanel({ type: "cat", slug })} /> : panel.type === "all" ? <ServicesPanel /> : panel.type === "cat" ? <CategoryPanel slug={panel.slug} onPick={(slug) => setPanel({ type: "prov", slug })} /> : panel.type === "prov" ? <ProviderPanel slug={panel.slug} onBack={(slug) => setPanel({ type: "cat", slug })} /> : null}
        </aside>
      )}
    </section>
  );
}

function CategoryPanel({ slug, onPick }: { slug: string; onPick: (slug: string) => void }) {
  const category = getCategory(slug);
  const providers = [...providersIn(slug)].sort((a, b) => b.score - a.score);
  if (!category) return null;
  const top = providers.slice(0, 3).map((provider) => provider.slug).join(",");
  return (
    <div>
      <p className="mono-label text-primary">{GLYPHS[slug] ?? "◆"} Category</p>
      <h3 className="display-md mt-3 text-3xl">{category.name}</h3>
      <p className="mt-3 text-muted-foreground">{category.intro || category.blurb}</p>
      <div className="mt-6 flex items-center gap-3"><p className="mono-label">Top rated</p><SampleBadge /></div>
      <div className="mt-3 border-t border-border">
        {providers.map((provider) => (
          <button key={provider.slug} type="button" onClick={() => onPick(provider.slug)} className="data-row flex w-full items-center justify-between gap-3 border-b border-border px-1 py-4 text-left">
            <span><span className="block font-display font-bold">{provider.name}</span><span className="text-sm text-muted-foreground">{provider.reviews.toLocaleString()} sample reviews</span></span>
            <span className="font-mono text-sm text-primary">{provider.score.toFixed(1)}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to={`/categories/${slug}`} className="btn-primary">View all <ArrowRight className="h-4 w-4" /></Link>
        {top && <Link to={`/compare?products=${top}`} className="btn-secondary">Compare top 3</Link>}
      </div>
    </div>
  );
}

function ProviderPanel({ slug, onBack }: { slug: string; onBack: (categorySlug: string) => void }) {
  const provider = getProvider(slug);
  if (!provider) return null;
  const category = getCategory(provider.category);
  const reviews = reviewsFor(slug).slice(0, 2);
  return (
    <div>
      <button type="button" onClick={() => onBack(provider.category)} className="mono-label text-primary hover:underline">← {category?.name}</button>
      <h3 className="display-md mt-3 text-3xl">{provider.name}</h3>
      <p className="mt-2 font-mono text-sm text-primary">★ {provider.score.toFixed(1)} · {provider.reviews.toLocaleString()} sample reviews</p>
      <p className="mt-3 text-muted-foreground">{provider.tagline}</p>
      <div className="mt-5 flex flex-wrap gap-2">{provider.featureList.slice(0, 5).map((feature) => <span key={feature} className="slab-tag px-2 py-1 font-mono text-[11px] text-muted-foreground">{feature}</span>)}</div>
      <div className="mt-6 flex items-center gap-3"><p className="mono-label">Recent feedback</p><SampleBadge /></div>
      {reviews.map((review) => <blockquote key={review.id} className="mt-3 border-l-2 border-primary pl-3 text-sm"><b>{review.title}</b><span className="block text-muted-foreground">{review.business}</span></blockquote>)}
      <div className="mt-7 flex flex-wrap gap-2">
        <Link to={`/software/${slug}`} className="btn-primary">Open full profile <ArrowRight className="h-4 w-4" /></Link>
        <Link to={`/compare?products=${slug}`} className="btn-secondary">Compare</Link>
        <Link to="/contact" className="btn-secondary">Request introduction</Link>
        <Link to={`/write-review?product=${slug}`} className="btn-secondary">Write a review</Link>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Introductions only happen with your consent. Reviews are never conditional on one.</p>
    </div>
  );
}

function DepartmentsPanel({ categories, onPick }: { categories: CoreCategory[]; onPick: (slug: string) => void }) {
  return (
    <div>
      <p className="mono-label text-primary">Departments</p>
      <h3 className="display-md mt-3 text-3xl">Every category in the network</h3>
      <div className="mt-5 border-t border-border">
        {categories.map((category) => (
          <button key={category.slug} type="button" onClick={() => onPick(category.slug)} className="data-row flex w-full items-start gap-3 border-b border-border px-1 py-4 text-left">
            <span className="font-mono text-primary">{category.glyph}</span>
            <span><span className="block font-display font-bold">{category.name}</span><span className="text-sm text-muted-foreground">{category.blurb}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ServicesPanel() {
  return (
    <div>
      <p className="mono-label text-primary">Everything we offer</p>
      <h3 className="display-md mt-3 text-3xl">Core services</h3>
      <div className="mt-5 border-t border-border">
        {SERVICES.map(([name, text, to]) => (
          <Link key={to} to={to} className="data-row flex items-center justify-between gap-3 border-b border-border px-1 py-4">
            <span><span className="block font-display font-bold">{name}</span><span className="text-sm text-muted-foreground">{text}</span></span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
