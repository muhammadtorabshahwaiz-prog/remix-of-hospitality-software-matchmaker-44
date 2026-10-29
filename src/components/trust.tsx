import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ShieldCheck, Scale, Wallet } from "lucide-react";
import { Card } from "@/components/fx";
import { absUrl } from "@/lib/site-config";

/** Any paid placement must carry this label. Organic rating order is never changed by payment. */
export function SponsoredBadge({ label = "Sponsored" }: { label?: "Sponsored" | "Featured" }) {
  return <span className="inline-block border border-muted-foreground/50 bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground">{label}</span>;
}

/** Trust strip: how we rate, how we make money, review integrity. */
export function TrustBar() {
  const items = [
    [Scale, "How we rate", "/methodology"],
    [Wallet, "How we make money", "/methodology"],
    [ShieldCheck, "Review integrity", "/disclosure"],
  ] as const;
  return (
    <div className="border-y border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground sm:px-6">
        {items.map(([I, l, to]) => (
          <Link key={l} to={to} className="flex items-center gap-2 hover:text-primary"><I className="h-4 w-4 text-primary" />{l}</Link>
        ))}
      </div>
    </div>
  );
}

export function AffiliateNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      Disclosure: some providers pay us referral fees, revenue share or per-lead fees. Paid placements are labeled Sponsored or Featured and never change organic rating order.{" "}
      <Link to="/disclosure" className="text-primary underline-offset-2 hover:underline">Read the full disclosure</Link>.
    </p>
  );
}

/** Honest cookie notice: only essential storage is used today. Extend when analytics are added. */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("hs-cookie-ok")) setShow(true); } catch { setShow(true); }
  }, []);
  if (!show) return null;
  const ok = () => { try { localStorage.setItem("hs-cookie-ok", "1"); } catch { /* ignore */ } setShow(false); };
  return (
    <div role="dialog" aria-label="Cookie notice" className="fixed bottom-4 left-4 right-4 z-[70] border border-border bg-card/95 p-4 text-sm backdrop-blur-xl sm:right-auto sm:max-w-sm">
      <p className="text-muted-foreground">We use only essential browser storage (your compare list and campaign source) to make the site work. No advertising cookies.{" "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy</Link></p>
      <button onClick={ok} className="mt-3 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/85">Got it</button>
    </div>
  );
}

/** Embeddable badge for claimed vendors. Plain HTML so it needs no script and links back to the profile. */
export function EmbedBadge({ slug, name }: { slug: string; name: string }) {
  const href = absUrl(`/software/${slug}`);
  const style = "display:inline-block;padding:8px 12px;border:1px solid #c8ff3d;background:#08090a;color:#c8ff3d;font:600 12px/1 monospace;text-decoration:none;letter-spacing:.05em";
  const code = `<a href="${href}" target="_blank" rel="noopener" style="${style}">Reviewed on Hospitalityservis</a>`;
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };
  return (
    <Card className="p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Embed badge · {name}</div>
      <a href={href} className="mt-3 inline-block border border-primary bg-background px-3 py-2 font-mono text-xs font-semibold tracking-wider text-primary">Reviewed on Hospitalityservis</a>
      <pre className="mt-3 max-h-28 overflow-auto border border-border bg-background p-3 text-[11px] text-muted-foreground"><code>{code}</code></pre>
      <button onClick={copy} className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy code"}</button>
    </Card>
  );
}

/** Category-page slot. Shows a labeled sponsored provider, or a vendor CTA when the slot is open. Never affects organic order. */
export function SponsoredSlot({ children }: { children?: ReactNode }) {
  if (children) return <div className="mb-6"><div className="mb-2"><SponsoredBadge /></div>{children}</div>;
  return (
    <div className="brackets mb-6 flex flex-wrap items-center justify-between gap-3 border border-dashed border-border p-4">
      <div className="flex items-center gap-3"><SponsoredBadge /><span className="text-sm text-muted-foreground">Sponsored slot open in this category. Paid slots are always labeled and never change ratings.</span></div>
      <Link to="/for-vendors" className="text-sm text-primary hover:underline">Reserve this slot</Link>
    </div>
  );
}
