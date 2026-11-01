import { useState } from "react";
import { Link } from "react-router";
import { Check, CreditCard, Landmark, FileText, Smartphone, ShieldCheck, Lock, Wallet, Bitcoin, Banknote, Globe, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/marketplace";
import { usePageTitle } from "@/lib/seo";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { getProvider } from "@/data/site";

type Plan = { id: string; name: string; monthly: number | null; blurb: string; features: string[]; cta: string };

const PLANS: Plan[] = [
  { id: "free", name: "Free", monthly: 0, blurb: "A credible starting point for your profile.", features: ["Claim and manage a profile", "Receive consented demo requests", "Respond to published reviews", "Profile badge"], cta: "Get listed" },
  { id: "pro", name: "Pro", monthly: 299, blurb: "More visibility and lead workflow for growing teams.", features: ["Everything in Free", "Eligible for labeled featured slots", "Lead status and notes workflow", "Category and competitor insights"], cta: "Choose Pro" },
  { id: "enterprise", name: "Enterprise", monthly: null, blurb: "For multi-product and regional vendor teams.", features: ["Everything in Pro", "Multiple products and markets", "Custom lead routing", "Partnership and reporting support"], cta: "Contact sales" },
];

// Optional hosted checkout links (for example Stripe Payment Links), set in .env as VITE_CHECKOUT_PRO_MONTHLY etc.
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const checkoutLink = (plan: string, yearly: boolean) => env[`VITE_CHECKOUT_${plan.toUpperCase()}_${yearly ? "YEARLY" : "MONTHLY"}`];

const METHODS = [
  { icon: CreditCard, name: "Cards", note: "Visa, Mastercard, American Express, Discover, Diners Club, JCB, UnionPay, Cartes Bancaires" },
  { icon: Smartphone, name: "Apple Pay, Google Pay and Link", note: "One tap on supported phones and browsers" },
  { icon: Wallet, name: "Digital wallets", note: "PayPal, Cash App Pay, Amazon Pay, Revolut Pay" },
  { icon: Landmark, name: "Bank debit", note: "ACH (US), SEPA (EU), Bacs (UK), PAD (Canada), BECS (Australia)" },
  { icon: Globe, name: "Bank redirects", note: "iDEAL, Bancontact, EPS, Przelewy24, Pay by Bank and more by country" },
  { icon: CalendarClock, name: "Buy now, pay later", note: "Klarna, Afterpay / Clearpay, Affirm where the plan and country allow it" },
  { icon: FileText, name: "Invoice and wire transfer", note: "Net-30 invoices and purchase orders for annual and Enterprise plans" },
  { icon: Bitcoin, name: "Crypto and local wallets", note: "Stablecoins and card-free options such as Wise, JazzCash and Easypaisa by request" },
];

// "Other ways to pay": a direct link if one is configured on the server, otherwise a request-an-invoice link.
const ALT = [
  { id: "paypal", name: "PayPal" },
  { id: "wise", name: "Wise / bank transfer" },
  { id: "crypto", name: "Crypto" },
  { id: "jazzcash", name: "JazzCash" },
  { id: "easypaisa", name: "Easypaisa" },
];

const FAQ = [
  ["When am I charged?", "Monthly plans renew every month on the day you subscribe. Annual plans are billed once a year and save 20%."],
  ["Can I cancel?", "Yes. Cancel any time from your workspace; paid features stay active until the end of the period you already paid for."],
  ["Do you offer refunds?", "Annual plans can be refunded in full within 14 days of purchase. Monthly plans are not refunded for partial months."],
  ["Does paying change my ratings?", "No. Payment buys labeled placements and tools only. Organic ratings and review moderation are independent."],
  ["Is my card data safe?", "Payments are processed by a PCI-compliant payment provider on its own page. Hospitalityservis never sees or stores your card number."],
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const billing = trpc.billing.status.useQuery(undefined, { retry: false });
  const dashboard = trpc.vendor.dashboard.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const approved = (dashboard.data?.claims ?? []).filter((c) => c.status === "approved");
  const [slug, setSlug] = useState("");
  const chosen = slug || approved[0]?.providerSlug || "";
  const checkout = trpc.billing.checkout.useMutation({ onSuccess: ({ url }) => { window.location.href = url; } });
  usePageTitle("Pricing and payments", "Vendor plans, accepted payment methods, billing and refund terms.");
  const [yearly, setYearly] = useState(false);
  const price = (p: Plan) => p.monthly === null ? "Custom" : p.monthly === 0 ? "$0" : `$${yearly ? Math.round(p.monthly * 0.8) : p.monthly}`;
  return (
    <>
      <PageHeader eyebrow="Pricing" title={<>Simple plans.<br />Clear billing.</>} breadcrumbs={[{ label: "Pricing" }]}>
        <p>Listing is free. Paid plans add labeled visibility and lead tools. Prices are in USD and exclude any applicable tax.</p>
      </PageHeader>
      <section className="site-container py-12 sm:py-20">
        <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1 text-sm font-semibold" role="group" aria-label="Billing period">
          {[false, true].map((y) => (
            <button key={String(y)} type="button" onClick={() => setYearly(y)} aria-pressed={yearly === y} className={`rounded-full px-5 py-2 transition-colors ${yearly === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{y ? "Yearly · save 20%" : "Monthly"}</button>
          ))}
        </div>
        {billing.data?.enabled && isAuthenticated && approved.length > 0 && (
          <label className="mx-auto mt-8 block max-w-sm text-sm font-medium">Choose the profile this plan is for
            <select className="field mt-1.5" value={chosen} onChange={(e) => setSlug(e.target.value)}>{approved.map((c) => <option key={c.id} value={c.providerSlug}>{getProvider(c.providerSlug)?.name ?? c.providerSlug}</option>)}</select>
          </label>
        )}
        {checkout.error && <p role="alert" className="mx-auto mt-6 max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{checkout.error.message}</p>}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const link = plan.monthly ? checkoutLink(plan.id, yearly) : undefined;
            const featured = plan.id === "pro";
            return (
              <article key={plan.id} className={`slab flex flex-col p-7 ${featured ? "border-primary" : ""}`} data-no-tilt>
                <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{plan.name}</h2>{featured && <span className="slab-tag px-3 py-1 text-xs font-semibold text-primary">Most chosen</span>}</div>
                <p className="mt-6 font-display text-5xl font-extrabold">{price(plan)}<span className="text-base font-medium text-muted-foreground">{plan.monthly ? "/mo" : ""}</span></p>
                {plan.monthly ? <p className="mt-1 text-xs text-muted-foreground">{yearly ? `Billed $${Math.round(plan.monthly * 0.8 * 12).toLocaleString()} per year` : "Billed monthly"}</p> : <p className="mt-1 text-xs text-muted-foreground">{plan.monthly === 0 ? "No card needed" : "Tailored to your team"}</p>}
                <p className="mt-5 text-muted-foreground">{plan.blurb}</p>
                <ul className="mt-6 space-y-3 text-sm">{plan.features.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}</ul>
                <div className="mt-auto pt-8">
                  {plan.id === "pro" && billing.data?.enabled ? (
                    !isAuthenticated ? <Link to="/login?next=/pricing" className="btn-primary w-full">Sign in to choose Pro</Link>
                    : !approved.length ? <Link to="/vendor" className="btn-secondary w-full">Claim your profile first</Link>
                    : <button type="button" className="btn-primary w-full" disabled={checkout.isPending} onClick={() => checkout.mutate({ plan: "pro", interval: yearly && billing.data?.yearly ? "yearly" : "monthly", providerSlug: chosen })}>{checkout.isPending ? "Opening secure checkout..." : plan.cta}</button>
                  ) : link ? <a href={link} className="btn-primary w-full" rel="noopener noreferrer">{plan.cta}</a> : <Link to={plan.id === "free" ? "/for-vendors#get-listed" : `/contact?plan=${plan.id}`} className={`${featured ? "btn-primary" : "btn-secondary"} w-full`}>{plan.cta}</Link>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="border-y border-border bg-card/40">
        <div className="site-container py-16 sm:py-20">
          <p className="mono-label text-primary">Payment methods</p>
          <h2 className="display-md mt-4">Pay the way your finance team prefers.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METHODS.map(({ icon: Icon, name, note }) => (
              <div key={name} className="slab p-6" data-no-tilt><Icon className="h-6 w-6 text-primary" /><h3 className="mt-4 font-display text-lg font-bold">{name}</h3><p className="mt-1 text-sm text-muted-foreground">{note}</p></div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Which of these appear at checkout depends on the buyer's country and currency and on the methods switched on for the account. Everything on this list is supported.</p>
          <h3 className="mt-10 font-display text-xl font-bold">Other ways to pay</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {ALT.map(({ id, name }) => {
              const url = billing.data?.links?.[id];
              return url
                ? <a key={id} href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary"><Banknote className="h-4 w-4" />Pay with {name}</a>
                : <Link key={id} to={`/contact?plan=pro&method=${id}`} className="btn-secondary"><Banknote className="h-4 w-4" />{name}: request invoice</Link>;
            })}
          </div>
          <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Lock className="h-4 w-4" />Encrypted checkout</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />We never see or store card numbers</span></p>
        </div>
      </section>
      <section className="site-container py-16 sm:py-24">
        <h2 className="display-md">Billing questions</h2>
        <div className="mt-8 max-w-3xl border-t border-border">{FAQ.map(([q, a]) => <details key={q} className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold">{q}<span className="text-primary transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 text-muted-foreground">{a}</p></details>)}</div>
        <p className="mt-8 text-sm text-muted-foreground">Need a quote, a purchase order or a different currency? <Link to="/contact?plan=enterprise" className="link-underline text-primary">Talk to us</Link>.</p>
      </section>
    </>
  );
}
