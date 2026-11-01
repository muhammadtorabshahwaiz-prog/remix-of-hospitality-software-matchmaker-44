import { useState, type FormEvent } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { PROVIDERS } from "@/data/site";
import { getAttribution } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

export function SimpleLeadForm({ type, showProduct = false, consentLabel, submitLabel = "Send message" }: { type: "contact" | "vendor_listing" | "operator_join"; showProduct?: boolean; consentLabel: string; submitLabel?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const mutation = trpc.marketplace.submitLead.useMutation();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("consent") !== "on") { setError("Please provide consent so we can respond to your request."); return; }
    try {
      await mutation.mutateAsync({
        type,
        providerSlug: String(form.get("providerSlug") || ""),
        name: String(form.get("name") || ""), email: String(form.get("email") || ""), company: String(form.get("company") || ""), phone: String(form.get("phone") || ""),
        interest: String(form.get("interest") || ""), notes: String(form.get("notes") || ""), consent: true, consentText: consentLabel,
        attribution: getAttribution(), companyUrl: String(form.get("companyUrl") || ""),
      });
      setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check the form and try again."); }
  };
  if (sent) return <div className="border border-border p-8" role="status"><Check className="h-7 w-7 text-primary" /><h3 className="mt-5 font-display text-2xl font-bold">Message received.</h3><p className="mt-3 text-muted-foreground">Your request is saved and ready for follow-up.</p></div>;
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <input name="companyUrl" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="text-sm font-semibold">Name<input name="name" required maxLength={100} className="field mt-2" autoComplete="name" /></label>
      <label className="text-sm font-semibold">Work email<input name="email" required type="email" maxLength={320} className="field mt-2" autoComplete="email" /></label>
      <label className="text-sm font-semibold">Company<input name="company" maxLength={160} className="field mt-2" autoComplete="organization" /></label>
      <label className="text-sm font-semibold">Phone <span className="font-normal text-muted-foreground">(optional)</span><input name="phone" maxLength={40} className="field mt-2" autoComplete="tel" /></label>
      {showProduct && <label className="text-sm font-semibold sm:col-span-2">Product to list or claim<select name="providerSlug" className="field mt-2"><option value="">New / not sure</option>{PROVIDERS.map((provider) => <option key={provider.slug} value={provider.slug}>{provider.name}</option>)}</select></label>}
      <label className="text-sm font-semibold sm:col-span-2">Topic<input name="interest" maxLength={200} className="field mt-2" placeholder={type === "contact" ? "How can we help?" : "Vendor plan or profile question"} /></label>
      <label className="text-sm font-semibold sm:col-span-2">Message<textarea name="notes" maxLength={2000} rows={5} className="field mt-2 resize-y" /></label>
      <label className="flex items-start gap-3 text-sm text-muted-foreground sm:col-span-2"><input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[oklch(var(--primary))]" /><span>{consentLabel}</span></label>
      {error && <p role="alert" className="border border-primary/50 bg-primary/10 p-3 text-sm text-primary sm:col-span-2">{error}</p>}
      <button type="submit" disabled={mutation.isPending} className="btn-primary sm:col-span-2 sm:justify-self-start">{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}{mutation.isPending ? "Sending" : submitLabel}</button>
    </form>
  );
}
