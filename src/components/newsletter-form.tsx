import { useState, type FormEvent } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { getAttribution } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

const CONSENT = "I agree to receive occasional software buying guides by email and can unsubscribe at any time.";

export function NewsletterForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const mutation = trpc.marketplace.submitLead.useMutation();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("consent") !== "on") { setError("Please tick the box so we may email you."); return; }
    const email = String(form.get("email") || "");
    try {
      await mutation.mutateAsync({ type: "newsletter", name: email.split("@")[0] || "Subscriber", email, consent: true, consentText: CONSENT, attribution: getAttribution(), companyUrl: String(form.get("companyUrl") || "") });
      setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check your email and try again."); }
  };
  if (sent) return <p role="status" className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Thanks, you are on the list.</p>;
  return (
    <form onSubmit={submit} className="mt-5 max-w-sm">
      <input name="companyUrl" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="mono-label text-muted-foreground" htmlFor="nl-email">Software buying guides, monthly</label>
      <div className="mt-2 flex gap-2">
        <input id="nl-email" name="email" type="email" required maxLength={320} placeholder="you@company.com" autoComplete="email" className="field !min-h-11 min-w-0 flex-1" />
        <button type="submit" disabled={mutation.isPending} className="btn-primary !px-5">{mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Join"}</button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[oklch(var(--primary))]" /><span>{CONSENT}</span></label>
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}
