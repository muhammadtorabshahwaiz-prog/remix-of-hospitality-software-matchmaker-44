import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Search, Star, X, ChevronRight, BadgeCheck, Menu, GitCompare, Inbox } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CATEGORIES, PROVIDERS, getCategory, getProvider, type Provider } from "@/data/site";
import { Card, Magnetic, Reveal, ScoreBar } from "./fx";

/* ---------- compare store ---------- */
let compare: string[] = [];
const subs = new Set<() => void>();
const emit = () => { subs.forEach((f) => f()); try { localStorage.setItem("hs-compare", JSON.stringify(compare)); } catch { /* ignore */ } };
export const compareStore = {
  toggle(slug: string) { compare = compare.includes(slug) ? compare.filter((s) => s !== slug) : compare.length >= 3 ? compare : [...compare, slug]; emit(); },
  clear() { compare = []; emit(); },
};
const EMPTY: string[] = [];
export function useCompare() {
  useEffect(() => {
    if (compare.length) return;
    try { const v = JSON.parse(localStorage.getItem("hs-compare") || "[]"); if (Array.isArray(v) && v.length) { compare = v.slice(0, 3); emit(); } } catch { /* ignore */ }
  }, []);
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => compare, () => EMPTY);
}

/* ---------- atoms ---------- */
export function CatIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Square;
  return <I className={className} />;
}
export const Sample = () => <span className="inline-block border border-primary/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">Sample</span>;
export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="font-mono text-xs uppercase tracking-widest text-primary">{children}</p>;
export function Stars({ value }: { value: number }) {
  return <span className="inline-flex items-center gap-1 font-mono text-sm text-primary"><Star className="h-4 w-4 fill-current" />{value.toFixed(1)}</span>;
}
export function Btn({ children, to, onClick, variant = "primary", type, className = "", params, search }: { children: ReactNode; to?: string; onClick?: () => void; variant?: "primary" | "ghost"; type?: "submit" | "button"; className?: string; params?: Record<string, string>; search?: Record<string, string> }) {
  const cls = `inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/85" : "border border-border text-foreground hover:border-primary hover:text-primary"} ${className}`;
  return (
    <Magnetic>
      {to ? <Link to={to as "/"} params={params as never} search={search as never} className={cls}>{children}</Link> : <button type={type ?? "button"} onClick={onClick} className={cls}>{children}</button>}
    </Magnetic>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="brackets border border-dashed border-border p-10 text-center">
      <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
export function SkeletonCards({ n = 3 }: { n?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: n }, (_, i) => <div key={i} className="h-44 animate-pulse border border-border bg-card" />)}</div>;
}
export const inputCls = "w-full border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";

/* ---------- breadcrumbs & page header ---------- */
export function Crumbs({ items }: { items: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      <Link to="/" className="hover:text-primary">Home</Link>
      {items.map((c) => (
        <span key={c.label} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {c.to ? <Link to={c.to as "/"} params={c.params as never} className="hover:text-primary">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
export function PageHead({ crumbs, eyebrow, title, children }: { crumbs: Parameters<typeof Crumbs>[0]["items"]; eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6">
        <Crumbs items={crumbs} />
        <Reveal className="mt-8">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {children && <div className="mt-5 max-w-2xl text-muted-foreground">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}
export const Section = ({ children, className = "" }: { children: ReactNode; className?: string }) => <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 ${className}`}>{children}</section>;

/* ---------- provider card ---------- */
export function ProviderCard({ p, rank }: { p: Provider; rank?: number }) {
  const sel = useCompare();
  const on = sel.includes(p.slug);
  const cat = getCategory(p.category);
  return (
    <Card tilt className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center border border-border bg-background font-mono text-sm text-primary">{rank ? String(rank).padStart(2, "0") : p.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <Link to="/software/$slug" params={{ slug: p.slug }} className="font-semibold hover:text-primary">{p.name}</Link>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{cat?.name}</div>
          </div>
        </div>
        <Stars value={p.score} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{p.tagline}</p>
      <div className="mt-4"><ScoreBar value={p.score} /></div>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase text-muted-foreground">
        <span>{p.reviews.toLocaleString()} reviews</span><span>/</span><span>{p.priceLabel}</span><span>/</span><Sample />
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={on} disabled={!on && sel.length >= 3} onChange={() => compareStore.toggle(p.slug)} className="h-4 w-4 accent-[var(--primary)]" />
          Compare
        </label>
        <Link to="/software/$slug" params={{ slug: p.slug }} className="flex items-center gap-1 text-sm hover:text-primary">View <ChevronRight className="h-4 w-4" /></Link>
      </div>
    </Card>
  );
}

/* ---------- compare tray ---------- */
export function CompareTray() {
  const sel = useCompare();
  if (!sel.length) return null;
  const [a, b, c] = sel;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-primary/40 bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <GitCompare className="h-5 w-5 text-primary" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{sel.length}/3</span>
        {sel.map((s) => (
          <span key={s} className="flex items-center gap-2 border border-border px-2 py-1 text-sm">
            {getProvider(s)?.name}
            <button aria-label="Remove" onClick={() => compareStore.toggle(s)} className="text-muted-foreground hover:text-primary"><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => compareStore.clear()} className="px-3 py-2 text-sm text-muted-foreground hover:text-primary">Clear</button>
          <Link to="/compare" search={{ a: a ?? "", b: b ?? "", c: c ?? "" }} className={`px-4 py-2 text-sm font-semibold ${sel.length > 1 ? "bg-primary text-primary-foreground" : "pointer-events-none border border-border text-muted-foreground"}`}>Compare now</Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- command palette ---------- */
export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const nav = useNavigate();
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!open); } };
    addEventListener("keydown", f); return () => removeEventListener("keydown", f);
  }, [open, setOpen]);
  const go = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search categories and providers..." />
      <CommandList>
        <CommandEmpty>No matches. Try "POS" or "Toast".</CommandEmpty>
        <CommandGroup heading="Categories">
          {CATEGORIES.map((c) => (
            <CommandItem key={c.slug} value={`cat ${c.name}`} onSelect={() => go(() => nav({ to: "/categories/$slug", params: { slug: c.slug } }))}>
              <CatIcon name={c.icon} className="mr-2 h-4 w-4" />{c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Providers">
          {PROVIDERS.map((p) => (
            <CommandItem key={p.slug} value={`pro ${p.name}`} onSelect={() => go(() => nav({ to: "/software/$slug", params: { slug: p.slug } }))}>
              <span className="mr-2 font-mono text-xs text-primary">{p.score.toFixed(1)}</span>{p.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/* ---------- nav + footer ---------- */
export function Logo({ className = "h-9 w-9 text-sm" }: { className?: string }) {
  return <div className={`grid shrink-0 place-items-center bg-primary font-mono font-bold text-primary-foreground ${className}`}>hs</div>;
}
const NAV = [["Categories", "/categories"], ["Reviews", "/reviews"], ["Compare", "/compare"], ["Financing", "/financing"], ["For vendors", "/for-vendors"]] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3"><Logo /><span className="hidden font-semibold tracking-tight sm:inline">Hospitalityservis</span></Link>
          <nav className="ml-6 hidden gap-6 text-sm text-muted-foreground lg:flex">
            {NAV.map(([l, h]) => (
              <Link key={h} to={h} className="group relative py-1 hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                {l}<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
              </Link>
            ))}
          </nav>
          <button onClick={() => setOpen(true)} className="ml-auto flex items-center gap-2 border border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary">
            <Search className="h-4 w-4" /><span className="hidden md:inline">Search</span><kbd className="hidden font-mono text-[10px] md:inline">⌘K</kbd>
          </button>
          <div className="hidden sm:block"><Btn to="/write-review">Write a review</Btn></div>
          <button aria-label="Menu" onClick={() => setMenu(!menu)} className="border border-border p-2 lg:hidden"><Menu className="h-5 w-5" /></button>
        </div>
        {menu && (
          <nav className="border-t border-border px-4 py-3 lg:hidden">
            {[...NAV, ["Write a review", "/write-review"] as const].map(([l, h]) => (
              <Link key={h} to={h} onClick={() => setMenu(false)} className="block py-2.5 text-sm hover:text-primary">{l}</Link>
            ))}
          </nav>
        )}
      </header>
      <CommandPalette open={open} setOpen={setOpen} />
    </>
  );
}

export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Discover", [["Categories", "/categories"], ["Reviews", "/reviews"], ["Compare", "/compare"], ["Financing", "/financing"]]],
    ["Best of", [["POS for food trucks", "/best/best-pos-for-food-trucks"], ["AI phone answering", "/best/best-ai-phone-answering"], ["Payment processing", "/best/best-restaurant-payment-processing"]]],
    ["Company", [["About", "/about"], ["Methodology", "/methodology"], ["For vendors", "/for-vendors"], ["Contact", "/contact"]]],
    ["Legal", [["Disclosure", "/disclosure"], ["Privacy", "/privacy"], ["Terms", "/terms"]]],
  ];
  return (
    <footer className="relative border-t border-border bg-background/80 pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-3"><Logo /><span className="font-semibold">Hospitalityservis</span></div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Where hospitality connects, evaluates, and grows.</p>
        </div>
        {cols.map(([h, links]) => (
          <div key={h}>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{h}</div>
            <ul className="mt-4 space-y-2 text-sm">{links.map(([l, to]) => <li key={to}><Link to={to as "/"} className="hover:text-primary">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-border px-4 pt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <span>© 2026 Hospitalityservis</span>
        <span>Reviews reflect genuine experiences. Commercial relationships disclosed.</span>
      </div>
    </footer>
  );
}

export { BadgeCheck };
