import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star } from "lucide-react";
import { Btn, PageHead, Section, inputCls } from "@/components/site";
import { PROVIDERS } from "@/data/site";

export const Route = createFileRoute("/write-review")({
  head: () => ({ meta: [
    { title: "Write a Review — Hospitalityservis" },
    { name: "description", content: "Share your honest experience with a restaurant software or service provider." },
    { property: "og:title", content: "Write a Review — Hospitalityservis" },
    { property: "og:description", content: "Help other operators make better decisions." },
  ] }),
  component: Page,
});

function Page() {
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHead crumbs={[{ label: "Write a review" }]} eyebrow="Transmit feedback" title="Write a review">Your review is never tied to buying anything. We publish only with your permission.</PageHead>
      <Section className="max-w-3xl">
        {sent ? <div className="flex items-center gap-2 border border-primary bg-accent p-6 text-primary"><Check className="h-5 w-5" />Thanks — we'll verify and publish your review.</div> : (
          <form onSubmit={(e) => { e.preventDefault(); if (rating) setSent(true); }} className="grid gap-4">
            <select required className={inputCls} defaultValue=""><option value="" disabled>Choose a provider</option>{PROVIDERS.map((p) => <option key={p.slug}>{p.name}</option>)}</select>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Overall rating</div>
              <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} aria-label={`${n} stars`} onClick={() => setRating(n)} className="border border-border p-2 hover:border-primary"><Star className={`h-5 w-5 ${n <= rating ? "fill-current text-primary" : "text-muted-foreground"}`} /></button>
              ))}</div>
            </div>
            <input required placeholder="Review title" className={inputCls} />
            <textarea required rows={6} placeholder="What works, what doesn't, and who it's best for" className={inputCls} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Your name" className={inputCls} />
              <input required type="email" placeholder="Email (not published)" className={inputCls} />
              <input placeholder="Business name" className={inputCls} />
              <input placeholder="City, State" className={inputCls} />
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground"><input required type="checkbox" className="mt-1 accent-[var(--primary)]" />I confirm this is my genuine experience and give permission to publish it.</label>
            <div><Btn type="submit">Submit review</Btn></div>
          </form>
        )}
      </Section>
    </>
  );
}
