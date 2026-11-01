import { Link } from "react-router";
import { getProvider } from "@/data/site";
import { FormError } from "@/components/auth-shell";
import { trpc } from "@/providers/trpc";

const LABEL: Record<string, string> = { active: "Active", trialing: "Trial", past_due: "Payment failed", canceled: "Cancelled", unpaid: "Unpaid", incomplete: "Incomplete" };

export function BillingPanel() {
  const subs = trpc.billing.mine.useQuery(undefined, { retry: false });
  const portal = trpc.billing.portal.useMutation({ onSuccess: ({ url }) => { window.location.href = url; } });
  return (
    <section aria-labelledby="bill-h" className="max-w-3xl">
      <h2 id="bill-h" className="font-display text-2xl font-bold">Billing</h2>
      <FormError message={portal.error?.message} />
      {subs.data?.length ? (
        <>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {subs.data.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span><span className="block font-semibold">{getProvider(s.providerSlug)?.name ?? s.providerSlug} · {s.plan}</span>
                  <span className="text-sm text-muted-foreground">{LABEL[s.status] ?? s.status}{s.currentPeriodEnd ? ` · renews or ends ${new Date(s.currentPeriodEnd).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}` : ""}</span></span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-primary mt-5" disabled={portal.isPending} onClick={() => portal.mutate()}>{portal.isPending ? "Opening..." : "Manage billing, invoices and cancellation"}</button>
        </>
      ) : (
        <p className="mt-4 text-muted-foreground">{subs.isLoading ? "Loading..." : <>No plan yet. <Link to="/pricing" className="font-semibold text-primary hover:underline">See vendor plans</Link>.</>}</p>
      )}
    </section>
  );
}
