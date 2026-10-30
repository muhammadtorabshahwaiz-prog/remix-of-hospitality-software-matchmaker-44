import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { useState } from "react";
import { ShieldCheck, Star } from "lucide-react";
import { Btn, PageHead, Section, inputCls } from "@/components/site";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { PROVIDERS } from "@/data/site";
import { submitReview } from "@/lib/submit";

export const Route = createFileRoute("/write-review")({
  head: () => ({ links: [canonical("/write-review")], meta: [
    { title: "Write a Review — Hospitalityservis" },
    { name: "description", content: "Share your honest experience with a software product." },
    { property: "og:title", content: "Write a Review — Hospitalityservis" },
    { property: "og:description", content: "Help other buyers make better decisions." },
  ] }),
  component: Page,
});

const lbl = "font-mono text-[11px] uppercase tracking-widest text-muted-foreground";

function Pick({ label, value, onChange, big = false }: { label: string; value: number; onChange: (n: number) => void; big?: boolean }) {
  return (
    <div>
      <div className={lbl}>{label}</div>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} aria-label={`${label}: ${n} stars`} aria-pressed={n === value} onClick={() => onChange(n === value && !big ? 0 : n)} className={`border border-border hover:border-primary ${big ? "p-2" : "p-1.5"}`}>
            <Star className={`${big ? "h-5 w-5" : "h-4 w-4"} ${n <= value ? "fill-current text-primary" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Page() {
  const [rating, setRating] = useState(0);
  const [sub, setSub] = useState({ ease: 0, value: 0, support: 0, features: 0 });
  const [incentivized, setIncentivized] = useState(false);
  const { busy, sent, err, onSubmit } = useSubmit((fd) => submitReview({
    provider: str(fd, "provider"), rating, ...sub,
    title: str(fd, "title"), body: str(fd, "body"), name: str(fd, "name"), email: str(fd, "email"),
    business: str(fd, "business"), city: str(fd, "city"),
    incentivized, relationship: str(fd, "relationship"),
    genuine: bool(fd, "genuine"), company_url: str(fd, "company_url"),
  }));
  return (
    <>
      <PageHead crumbs={[{ label: "Write a review" }]} eyebrow="Transmit feedback" title="Write a review">Your review is never tied to buying anything. We publish only after moderation and with your permission.</PageHead>
      <Section className="max-w-3xl">
        <div className="brackets mb-8 flex gap-4 border border-primary/40 bg-accent p-5 text-sm">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="font-semibold text-primary">Review integrity</div>
            <p className="mt-1 text-muted-foreground">Reviews are never conditional on introductions, purchases or referrals. Commercial relationships are disclosed. Your contact details are never shared without your consent. Every review is moderated before it appears.</p>
          </div>
        </div>
        {sent ? <Sent mode={sent}>Thanks. Your review is waiting for moderation and is not published yet.</Sent> : (
          <form onSubmit={onSubmit} className="relative grid gap-5" noValidate>
            <Honeypot />
            <select name="provider" required defaultValue="" className={inputCls} aria-label="Provider">
              <option value="" disabled>Choose a provider</option>
              {PROVIDERS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
            <Pick big label="Overall rating" value={rating} onChange={setRating} />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Pick label="Ease of use" value={sub.ease} onChange={(n) => setSub({ ...sub, ease: n })} />
              <Pick label="Value" value={sub.value} onChange={(n) => setSub({ ...sub, value: n })} />
              <Pick label="Support" value={sub.support} onChange={(n) => setSub({ ...sub, support: n })} />
              <Pick label="Features" value={sub.features} onChange={(n) => setSub({ ...sub, features: n })} />
            </div>
            <input name="title" required maxLength={120} placeholder="Review title" className={inputCls} />
            <textarea name="body" required rows={6} maxLength={4000} placeholder="What works, what doesn't, and who it's best for" className={inputCls} />
            <div className="grid gap-6 sm:grid-cols-2">
              <input name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
              <input name="email" required type="email" maxLength={255} placeholder="Email (not published)" className={inputCls} />
              <input name="business" maxLength={120} placeholder="Company" className={inputCls} />
              <input name="city" maxLength={120} placeholder="City / Country" className={inputCls} />
            </div>
            <fieldset className="grid gap-3 border border-border p-4">
              <legend className={`px-2 ${lbl}`}>Disclosure</legend>
              <label className="flex items-start gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={incentivized} onChange={(e) => setIncentivized(e.target.checked)} className="mt-1 accent-[var(--primary)]" />I received a discount, gift or other incentive in connection with this review.</label>
              <textarea name="relationship" rows={2} maxLength={500} placeholder="Any commercial relationship with this vendor (employee, partner, referral)? Leave blank if none." className={inputCls} />
            </fieldset>
            <label className="flex items-start gap-2 text-sm text-muted-foreground"><input name="genuine" required type="checkbox" className="mt-1 accent-[var(--primary)]" />This review reflects my genuine experience, and I give permission to publish it after moderation.</label>
            <FormError message={err} />
            <div><Btn type="submit">{busy ? "Submitting..." : "Submit review"}</Btn></div>
          </form>
        )}
      </Section>
    </>
  );
}
