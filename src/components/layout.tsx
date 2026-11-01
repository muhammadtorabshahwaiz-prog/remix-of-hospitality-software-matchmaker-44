import { CookieConsent } from "@/components/cookie-consent";
import { CursorFx } from "@/components/cursor-fx";
import { A11yMenu, ModeToggle } from "@/components/a11y-menu";
import { SiteFx } from "@/components/site-fx";
import { WorldMapBackground } from "@/components/world-map-background";
import { BitsGlitchBackground } from "@/components/bits-glitch-background";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { ArrowRight, GitCompareArrows, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CATEGORIES, PROVIDERS, getProvider } from "@/data/site";
import { captureAttribution } from "@/lib/seo";
import { useAuth } from "@/hooks/useAuth";
import { useCompare } from "./compare-context";
import { CatIcon } from "./marketplace";
import { NewsletterForm } from "@/components/newsletter-form";
import { useTrack } from "@/hooks/useTrack";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Hospitalityservis home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-mono text-base font-semibold text-primary-foreground" style={{ boxShadow: "var(--sh-btn)" }}>01</span>
      <span className="font-display text-lg font-bold tracking-tight">Hospitalityservis</span>
    </Link>
  );
}

function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const go = (to: string) => { onOpenChange(false); navigate(to); };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search 30 categories and 97 sample products…" />
      <CommandList className="max-h-[60dvh]">
        <CommandEmpty>No matches. Try a category or product name.</CommandEmpty>
        <CommandGroup heading="Categories">
          {CATEGORIES.map((category) => (
            <CommandItem key={category.slug} value={`category ${category.name}`} onSelect={() => go(`/categories/${category.slug}`)}>
              <CatIcon name={category.icon} className="mr-2 h-4 w-4" />{category.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Products">
          {PROVIDERS.map((provider) => (
            <CommandItem key={provider.slug} value={`product ${provider.name}`} onSelect={() => go(`/software/${provider.slug}`)}>
              <span className="mr-2 font-mono text-xs text-primary">{provider.score.toFixed(1)}</span>{provider.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const nav = [
    ["Categories", "/categories"], ["Reviews", "/reviews"], ["Compare", "/compare"], ["For vendors", "/for-vendors"],
  ];
  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-border">
        <div className="site-container flex h-[72px] items-center gap-5">
          <Logo />
          <nav className="ml-8 hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {nav.map(([label, to]) => (
              <NavLink key={to} to={to!} className={({ isActive }) => `link-underline py-2 text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{label}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <button type="button" onClick={() => setSearchOpen(true)} className="edge flex min-h-11 items-center gap-2 border border-border px-4 text-sm text-muted-foreground hover:text-primary" aria-label="Search software">
              <Search className="h-4 w-4" /><span className="hidden md:inline">Search</span><kbd className="hidden font-mono text-[10px] md:inline">⌘K</kbd>
            </button>
            <Link to={isAuthenticated ? "/vendor" : "/login"} className="btn-primary hidden !min-h-11 sm:inline-flex">
              <UserRound className="h-4 w-4" />{isAuthenticated ? "Workspace" : "Sign in"}
            </Link>
            {isAuthenticated && <Link to="/account" className="btn-secondary hidden !min-h-11 sm:inline-flex">Account</Link>}
            {isAuthenticated && <button type="button" onClick={logout} aria-label={`Sign out ${user?.name || "user"}`} className="hidden h-11 w-11 place-items-center rounded-full border border-border hover:border-primary hover:text-primary sm:grid"><LogOut className="h-4 w-4" /></button>}
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-border lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-background px-4 py-4 lg:hidden" aria-label="Mobile navigation">
            {nav.map(([label, to]) => <NavLink key={to} to={to!} className="flex min-h-12 items-center border-b border-border font-display text-xl font-bold">{label}</NavLink>)}
            <NavLink to={isAuthenticated ? "/vendor" : "/login"} className="flex min-h-12 items-center border-b border-border font-display text-xl font-bold">{isAuthenticated ? "Workspace" : "Sign in"}</NavLink>
            <NavLink to="/write-review" className="btn-primary mt-4 w-full">Write a review</NavLink>
          </nav>
        )}
      </header>
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function CompareTray() {
  const { selected, remove, clear } = useCompare();
  const track = useTrack();
  if (!selected.length) return null;
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/50 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl" aria-label="Comparison tray">
      <div className="site-container flex flex-wrap items-center gap-2 py-3">
        <span className="mono-label mr-2 flex items-center gap-2 text-primary"><GitCompareArrows className="h-4 w-4" />{selected.length}/3</span>
        <div className="no-scrollbar flex max-w-full flex-1 gap-2 overflow-x-auto">
          {selected.map((slug) => (
            <span key={slug} className="flex shrink-0 items-center gap-2 border border-border px-3 py-1.5 text-sm">{getProvider(slug)?.name ?? slug}<button type="button" onClick={() => remove(slug)} aria-label={`Remove ${getProvider(slug)?.name ?? slug}`} className="text-muted-foreground hover:text-primary"><X className="h-3.5 w-3.5" /></button></span>
          ))}
        </div>
        <button type="button" onClick={clear} className="min-h-11 px-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary">Clear</button>
        <Link onClick={() => track("compare_start", selected.join(","))} to={`/compare?products=${selected.join(",")}`} className={selected.length >= 2 ? "btn-primary" : "btn-secondary pointer-events-none opacity-50"} aria-disabled={selected.length < 2}>Compare <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </aside>
  );
}

function Footer() {
  const columns = [
    { title: "Discover", links: [["All categories", "/categories"], ["Latest reviews", "/reviews"], ["Compare software", "/compare"], ["Business financing", "/financing"]] },
    { title: "Popular guides", links: [["Best CRM", "/best/best-crm-for-small-business"], ["Best project tools", "/best/best-project-management-tools"], ["Best support software", "/best/best-customer-support-software"], ["Best AI voice agents", "/best/best-ai-phone-answering"]] },
    { title: "Company", links: [["About", "/about"], ["Methodology", "/methodology"], ["For vendors", "/for-vendors"], ["Pricing", "/pricing"], ["Contact", "/contact"]] },
    { title: "Trust & legal", links: [["Disclosure", "/disclosure"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Accessibility", "/accessibility"]] },
  ];
  return (
    <footer className="mt-24 border-t border-border pb-28">
      <div className="site-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-muted-foreground">Independent software discovery, honest user feedback, and introductions on your terms.</p>
          <Link to="/write-review" className="btn-secondary mt-7">Write a review</Link>
          <NewsletterForm />
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="mono-label text-muted-foreground">{column.title}</h2>
            <ul className="mt-5 space-y-3 text-sm">{column.links.map(([label, to]) => <li key={to}><Link to={to!} className="link-underline hover:text-primary">{label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="site-container border-t border-border pt-6 text-sm text-muted-foreground">
        <p>Commercial relationships and sponsored placements are disclosed. Payment never changes organic ratings.</p>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs">{["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Bank transfer", "Invoice"].map((m) => <span key={m} className="slab-tag px-2.5 py-1 font-semibold">{m}</span>)}<span>Secure checkout · we never store card numbers</span></p>
        <p className="mt-4 text-xs">© 2026 Hospitalityservis · Sample catalog for product preview</p>
      </div>
      <div aria-hidden="true" className="site-container mt-16 overflow-hidden font-display text-[clamp(3.6rem,12.5vw,12rem)] font-black leading-none tracking-[-0.07em] text-secondary">servis/</div>
    </footer>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  useEffect(() => { captureAttribution(); }, [location.search]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  return (
    <div className="min-h-[100dvh]">
      <WorldMapBackground />
      <BitsGlitchBackground />
      <SiteFx />
      <CursorFx />
      <A11yMenu />
      <Header />
      <main className="relative z-10">{children ?? <Outlet />}</main>
      <div className="relative z-10"><Footer /></div>
      <CompareTray />
      <CookieConsent />
    </div>
  );
}
