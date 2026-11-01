import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/marketplace";
import { PROVIDERS, getProvider } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

function RatingField({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return <label className="text-sm font-semibold">{label}<select name={name} required={required} defaultValue={required ? "" : "0"} className="field mt-2">{!required && <option value={0}>Not rated</option>}{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} — {["", "Poor", "Fair", "Good", "Very good", "Excellent"][value]}</option>)}</select></label>;
}

export default function WriteReview() {
  usePageTitle("Write a software review", "Share genuine software experience for moderation. Reviews are never conditional on purchases, introductions, or referrals.");
  const [params] = useSearchParams();
  const initial = getProvider(params.get("product") || "")?.slug || "";
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const mutation = trpc.marketplace.submitReview.useMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("genuine") !== "on") { setError("Please confirm that this review reflects your genuine experience."); return; }
    try {
      await mutation.mutateAsync({
        providerSlug: String(form.get("providerSlug") || ""),
        rating: Number(form.get("rating")),
        ease: Number(form.get("ease")), value: Number(form.get("value")), support: Number(form.get("support")), features: Number(form.get("features")),
        title: String(form.get("title") || ""), body: String(form.get("body") || ""), pros: String(form.get("pros") || ""), cons: String(form.get("cons") || ""),
        reviewerName: String(form.get("reviewerName") || ""), reviewerEmail: String(form.get("reviewerEmail") || ""), reviewerRole: String(form.get("reviewerRole") || ""), business: String(form.get("business") || ""), city: String(form.get("city") || ""),
        incentivized: form.get("incentivized") === "on", relationship: String(form.get("relationship") || ""), genuine: true, companyUrl: String(form.get("companyUrl") || ""),
      });
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check the form and try again."); }
  };

  return (
    <>
      <PageHeader eyebrow="Community review" title={<>Share what worked.<br />And what didn’t.</>} breadcrumbs={[{ label: "Reviews", to: "/reviews" }, { label: "Write a review" }]}>
        <p>Your review is saved as pending and is not public until moderated. Your email is used for review administration and is never published.</p>
      </PageHeader>
      <div className="site-container py-16 sm:py-24">
        {sent ? <div className="mx-auto max-w-2xl border border-border p-8 sm:p-12" role="status"><span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground"><Check className="h-6 w-6" /></span><h2 className="display-md mt-7">Review received.</h2><p className="mt-4 text-lg text-muted-foreground">It is now in the moderation queue. If approved, it will appear on the product profile. Verification is shown only if separately confirmed.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/reviews" className="btn-primary">Browse reviews</Link><Link to="/categories" className="btn-secondary">Explore software</Link></div></div> : (
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
              <input name="companyUrl" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <label className="text-sm font-semibold sm:col-span-2">Product reviewed<select name="providerSlug" required defaultValue={initial} className="field mt-2"><option value="" disabled>Choose a product</option>{PROVIDERS.map((provider) => <option key={provider.slug} value={provider.slug}>{provider.name}</option>)}</select></label>
              <RatingField label="Overall rating" name="rating" required /><RatingField label="Ease of use" name="ease" /><RatingField label="Value for money" name="value" /><RatingField label="Customer support" name="support" /><RatingField label="Features" name="features" />
              <label className="text-sm font-semibold sm:col-span-2">Review title<input name="title" required minLength={3} maxLength={160} className="field mt-2" placeholder="Sum up your experience" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Your experience<textarea name="body" required minLength={20} maxLength={4000} rows={6} className="field mt-2 resize-y" placeholder="What did you use it for? What improved, and what should buyers watch out for?" /></label>
              <label className="text-sm font-semibold">Pros <span className="font-normal text-muted-foreground">(optional)</span><textarea name="pros" maxLength={1500} rows={3} className="field mt-2 resize-y" /></label>
              <label className="text-sm font-semibold">Cons <span className="font-normal text-muted-foreground">(optional)</span><textarea name="cons" maxLength={1500} rows={3} className="field mt-2 resize-y" /></label>
              <label className="text-sm font-semibold">Your name<input name="reviewerName" required maxLength={100} autoComplete="name" className="field mt-2" /></label>
              <label className="text-sm font-semibold">Email <span className="font-normal text-muted-foreground">(not published)</span><input name="reviewerEmail" required type="email" maxLength={320} autoComplete="email" className="field mt-2" /></label>
              <label className="text-sm font-semibold">Role<input name="reviewerRole" maxLength={120} className="field mt-2" placeholder="Owner, IT lead, manager…" /></label>
              <label className="text-sm font-semibold">Company<input name="business" maxLength={160} autoComplete="organization" className="field mt-2" /></label>
              <label className="text-sm font-semibold sm:col-span-2">City / region<input name="city" maxLength={120} className="field mt-2" /></label>
              <label className="flex items-start gap-3 text-sm sm:col-span-2"><input name="incentivized" type="checkbox" className="mt-1 h-5 w-5 accent-[oklch(var(--primary))]" /><span>I received an incentive or have a commercial relationship that readers should know about.</span></label>
              <label className="text-sm font-semibold sm:col-span-2">Relationship / incentive details <span className="font-normal text-muted-foreground">(if applicable)</span><textarea name="relationship" maxLength={1000} rows={3} className="field mt-2 resize-y" /></label>
              <label className="flex items-start gap-3 border border-border p-5 text-sm sm:col-span-2"><input name="genuine" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[oklch(var(--primary))]" /><span>This review reflects my genuine experience. I understand it will be moderated before publication.</span></label>
              {error && <p role="alert" className="border border-primary/50 bg-primary/10 p-4 text-sm text-primary sm:col-span-2">{error}</p>}
              <button type="submit" disabled={mutation.isPending} className="btn-primary sm:col-span-2 sm:justify-self-start">{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}{mutation.isPending ? "Submitting" : "Submit for moderation"}</button>
            </form>
            <aside className="h-fit border-t border-border pt-6 lg:sticky lg:top-24"><ShieldCheck className="h-7 w-7 text-primary" /><h2 className="mt-5 font-display text-2xl font-bold">Review integrity</h2><ul className="mt-5 space-y-4 text-muted-foreground"><li>Reviews are never conditional on introductions, purchases, or referrals.</li><li>Commercial relationships and incentives must be disclosed.</li><li>Contact details are never shared without consent.</li><li>“Verified” appears only when verification has actually been completed.</li></ul><Link to="/methodology" className="mono-label mt-6 inline-block text-primary link-underline">Read the methodology</Link></aside>
          </div>
        )}
      </div>
    </>
  );
}
