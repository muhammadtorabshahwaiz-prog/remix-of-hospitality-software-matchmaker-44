import { HelpfulButton } from "@/components/helpful-button";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, BadgeCheck, BarChart3, Bike, Bookmark, Boxes, Calculator, CalendarCheck, CalendarClock, Check, ChevronRight, ClipboardList, Cloud, CreditCard, FileSignature, Gift, GitCompareArrows, Globe, Handshake, Inbox, KeyRound, Landmark, LifeBuoy, LoaderCircle, Megaphone, MessagesSquare, MonitorSmartphone, PhoneCall, Receipt, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Square, Star, Target, Truck, Users, Video, Wrench, X, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCategory, type Provider, type Review } from "@/data/site";
import { getAttribution } from "@/lib/seo";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useCompare } from "./compare-context";

const categoryIcons: Record<string, LucideIcon> = { Handshake, Megaphone, Target, LifeBuoy, PhoneCall, ClipboardList, MessagesSquare, Video, FileSignature, Users, Calculator, Receipt, ShieldCheck, KeyRound, Wrench, Cloud, BarChart3, Sparkles, ShoppingCart, Globe, MonitorSmartphone, CreditCard, Landmark, CalendarCheck, ShoppingBag, Gift, Truck, Boxes, CalendarClock, Bike };
export function CatIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Icon = categoryIcons[name] ?? Square;
  return <Icon aria-hidden="true" className={className} />;
}

export function SampleBadge() {
  return <span className="mono-label slab-tag inline-flex border-primary/60 px-1.5 py-0.5 text-[9px] text-primary">Sample</span>;
}

export function SponsoredBadge() {
  return <span className="mono-label inline-flex bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">Sponsored</span>;
}

export function Stars({ value, showNumber = true }: { value: number; showNumber?: boolean }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2" aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="flex gap-0.5 text-primary" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(value) ? "fill-current" : "opacity-30"}`} />)}
      </span>
      {showNumber && <span className="font-mono text-xs font-semibold">{value.toFixed(1)}</span>}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mono-label flex flex-wrap items-center gap-1.5 text-muted-foreground">
      <Link to="/" className="link-underline hover:text-foreground">Home</Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.to ? <Link to={item.to} className="link-underline hover:text-foreground">{item.label}</Link> : <span className="text-foreground">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ eyebrow, title, children, breadcrumbs }: { eyebrow: string; title: ReactNode; children?: ReactNode; breadcrumbs: { label: string; to?: string }[] }) {
  return (
    <header className="border-b border-border">
      <div className="site-container pb-14 pt-8 sm:pb-20 sm:pt-10">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mono-label text-primary">{eyebrow}</p>
            <h1 className="display-lg mt-5 max-w-5xl text-balance">{title}</h1>
          </div>
          {children && <div className="max-w-xl text-lg text-muted-foreground lg:col-span-4">{children}</div>}
        </div>
      </div>
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-dashed border-border px-6 py-16 text-center">
      <Inbox className="mx-auto h-7 w-7 text-muted-foreground" />
      <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{children}</p>
    </div>
  );
}

export function SaveButton({ providerSlug, className = "" }: { providerSlug: string; className?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const dashboard = trpc.vendor.dashboard.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const saved = dashboard.data?.saved.some((item) => item.providerSlug === providerSlug) ?? false;
  const mutation = trpc.vendor.saveProduct.useMutation({
    onSuccess: async () => { await utils.vendor.dashboard.invalidate(); },
  });
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved products" : "Save product"}
      aria-pressed={saved}
      disabled={mutation.isPending}
      onClick={() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        mutation.mutate({ providerSlug, saved: !saved });
      }}
      className={`edge inline-flex min-h-11 items-center gap-2 border border-border px-4 font-mono text-[11px] uppercase tracking-wider hover:text-primary ${saved ? "text-primary" : ""} ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
    </button>
  );
}

export function CompareButton({ providerSlug }: { providerSlug: string }) {
  const { selected, toggle } = useCompare();
  const [message, setMessage] = useState("");
  const active = selected.includes(providerSlug);
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-pressed={active}
        onClick={() => {
          const ok = toggle(providerSlug);
          setMessage(ok ? "" : "You can compare up to three products.");
          if (!ok) window.setTimeout(() => setMessage(""), 2500);
        }}
        className={`edge inline-flex min-h-11 items-center gap-2 border px-4 font-mono text-[11px] uppercase tracking-wider ${active ? "border-primary text-primary" : "border-border hover:border-primary hover:text-primary"}`}
      >
        {active ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />} {active ? "Added" : "Compare"}
      </button>
      {message && <span className="text-xs text-primary" role="status">{message}</span>}
    </div>
  );
}

export function ProviderRow({ provider, rank, sponsored = false }: { provider: Provider; rank?: number; sponsored?: boolean }) {
  const category = getCategory(provider.category);
  return (
    <article className="slab mb-6 grid gap-5 px-4 py-7 sm:px-6 lg:grid-cols-[64px_minmax(220px,1.3fr)_minmax(180px,.8fr)_130px_auto] lg:items-center lg:gap-6">
      <div className="flex items-center justify-between lg:block">
        <span className="font-mono text-sm text-muted-foreground">{rank ? String(rank).padStart(2, "0") : provider.name.slice(0, 2).toUpperCase()}</span>
        <div className="flex gap-2 lg:hidden"><SampleBadge />{sponsored && <SponsoredBadge />}</div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/software/${provider.slug}`} className="font-display text-xl font-bold link-underline hover:text-primary">{provider.name}</Link>
          {provider.claimed && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Claimed profile" />}
          <span className="hidden gap-2 lg:flex"><SampleBadge />{sponsored && <SponsoredBadge />}</span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{provider.tagline}</p>
        <p className="mono-label mt-3 text-muted-foreground lg:hidden">{category?.name}</p>
      </div>
      <div className="hidden lg:block">
        <p className="text-sm">{category?.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{provider.companySize} business · {provider.priceLabel}</p>
      </div>
      <div>
        <Stars value={provider.score} />
        <p className="mt-1 text-xs text-muted-foreground">{provider.reviews.toLocaleString()} sample reviews</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <CompareButton providerSlug={provider.slug} />
        <Link to={`/software/${provider.slug}`} aria-label={`View ${provider.name}`} className="edge grid h-11 w-11 place-items-center border border-border hover:text-primary"><ArrowRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

export type DisplayReview = {
  live?: boolean;
  helpful?: number;
  id: string | number;
  provider: string;
  author: string;
  role?: string | null;
  business?: string | null;
  rating: number;
  title: string;
  body: string;
  date: string;
  sample?: boolean;
  verified?: boolean;
  incentivized?: boolean;
  vendorResponse?: string | null;
};

export function sampleToDisplay(review: Review): DisplayReview {
  return { id: review.id, provider: review.provider, author: review.author, role: review.role, business: review.business, rating: review.rating, title: review.title, body: review.body, date: review.date, sample: true };
}

export function ReviewCard({ review, showProvider = false }: { review: DisplayReview; showProvider?: boolean }) {
  return (
    <article className="slab mb-6 px-5 py-7 sm:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <Stars value={review.rating} />
        {review.verified && <span className="mono-label inline-flex items-center gap-1 text-primary"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
        {review.sample && <SampleBadge />}
        {review.incentivized && <span className="mono-label text-muted-foreground">Incentive disclosed</span>}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">{review.title}</h3>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{review.body}</p>
      <div className="mono-label mt-5 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
        <span>{review.author}</span>{review.role && <span>· {review.role}</span>}{review.business && <span>· {review.business}</span>}<span>· {review.date}</span>
      </div>
      {showProvider && <Link to={`/software/${review.provider}`} className="mono-label mt-4 inline-flex items-center gap-2 text-primary link-underline">View product <ArrowRight className="h-3.5 w-3.5" /></Link>}
      {review.live && typeof review.id === "number" && <HelpfulButton id={review.id} count={review.helpful ?? 0} />}
      {review.vendorResponse && (
        <div className="mt-6 border-l border-primary pl-5">
          <p className="mono-label text-primary">Vendor response</p>
          <p className="mt-2 text-muted-foreground">{review.vendorResponse}</p>
        </div>
      )}
    </article>
  );
}

type LeadDialogProps = { provider: Provider; children: ReactNode; type?: "demo" | "vendor_listing" };
export function LeadDialog({ provider, children, type = "demo" }: LeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const mutation = trpc.marketplace.submitLead.useMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await mutation.mutateAsync({
        type,
        providerSlug: provider.slug,
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        company: String(form.get("company") || ""),
        phone: String(form.get("phone") || ""),
        city: String(form.get("city") || ""),
        interest: String(form.get("interest") || ""),
        notes: String(form.get("notes") || ""),
        consent: form.get("consent") === "on" ? true : (false as never),
        consentText: `I agree that Hospitalityservis may share these details with ${provider.name} about this request.`,
        attribution: getAttribution(),
        companyUrl: String(form.get("companyUrl") || ""),
      });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please check the form and try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setSent(false); setError(""); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto border-border bg-card p-0 text-card-foreground sm:max-w-3xl">
        <DialogHeader className="border-b border-border p-6 text-left sm:p-8">
          <p className="mono-label text-primary">Qualified introduction</p>
          <DialogTitle className="font-display text-3xl font-extrabold">Talk to {provider.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Free for buyers. Your details go to this provider only with your explicit consent.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="p-8 sm:p-10" role="status">
            <span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground"><Check className="h-6 w-6" /></span>
            <h3 className="mt-6 font-display text-2xl font-bold">Request received.</h3>
            <p className="mt-3 text-muted-foreground">Your request is now in the lead inbox. The team can route it to {provider.name} for follow-up.</p>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-8">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <input name="companyUrl" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label className="text-sm">Full name<input name="name" required maxLength={100} className="field mt-2" autoComplete="name" /></label>
            <label className="text-sm">Work email<input name="email" required type="email" maxLength={320} className="field mt-2" autoComplete="email" /></label>
            <label className="text-sm">Company<input name="company" maxLength={160} className="field mt-2" autoComplete="organization" /></label>
            <label className="text-sm">Phone <span className="text-muted-foreground">(optional)</span><input name="phone" maxLength={40} className="field mt-2" autoComplete="tel" /></label>
            <label className="text-sm">City / region<input name="city" maxLength={120} className="field mt-2" /></label>
            <label className="text-sm">What do you need?<select name="interest" className="field mt-2" defaultValue="Product demo"><option>Product demo</option><option>Pricing quote</option><option>Migration advice</option><option>Partnership</option></select></label>
            <label className="text-sm sm:col-span-2">Notes <span className="text-muted-foreground">(optional)</span><textarea name="notes" maxLength={2000} rows={4} className="field mt-2 resize-y" placeholder="Team size, current tools, timeline…" /></label>
            <label className="flex items-start gap-3 text-sm text-muted-foreground sm:col-span-2"><input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[oklch(var(--primary))]" /><span>I agree that Hospitalityservis may share these details with <strong className="text-foreground">{provider.name}</strong> about this request.</span></label>
            {error && <p role="alert" className="border border-primary/50 bg-primary/10 p-3 text-sm text-primary sm:col-span-2">{error}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button type="submit" disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{mutation.isPending ? "Sending" : "Send request"}</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LineWipe() {
  return (
    <div aria-hidden="true" className="line-wipe overflow-hidden" style={{ paddingTop: 30 }}>
      {Array.from({ length: 30 }, (_, index) => {
        const progress = (index + 1) / 30;
        return <div key={index} className="line-bar mx-auto" style={{ height: `${Math.max(1, progress * 30)}px`, width: `${Math.max(10, progress * 100)}%`, marginBottom: `${Math.max(1, 31 - index)}px`, opacity: 0.3 + progress * 0.7 }} />;
      })}
    </div>
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return <button type="button" onClick={onClick} aria-label={label} className="edge grid h-11 w-11 place-items-center border border-border hover:text-primary"><X className="h-4 w-4" /></button>;
}
