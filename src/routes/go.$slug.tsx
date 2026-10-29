import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { Card, Reveal } from "@/components/fx";
import { Btn, Empty, Eyebrow, Sample, Section, Stars, inputCls } from "@/components/site";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { AffiliateNote } from "@/components/trust";
import { getPartner } from "@/data/partners";
import { getProvider, reviewsFor } from "@/data/site";
import { captureAttribution, submitLead } from "@/lib/submit";
import { absUrl } from "@/lib/site-config";

export const Route = createFileRoute("/go/$slug")({
  loader: ({ params }) => {
    const partner = getPartner(params.slug);
    const provider = partner ? getProvider(partner.provider) : undefined;
    if (!partner || !provider) throw notFound();
    return { partner, provider };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.partner.headline} — Hospitalityservis` },
      { name: "description", content: loaderData.partner.sub },
      { property: "og:title", content: loaderData.partner.headline },
      { property: "og:description", content: loaderData.partner.sub },
      // Sample copy for now: remove this noindex once the partner page has approved, real content.
      { name: "robots", content: "noindex" },
    ] : [{ title: "Page not found" }, { name: "robots", content: "noindex" }],
    links: loaderData ? [{ rel: "canonical", href: absUrl(`/go/${loaderData.partner.slug}`) }] : [],
  }),
  notFoundComponent: () => <Section><Empty title="Page not found"><Link to="/categories" className="text-primary">Browse categories</Link></Empty></Section>,
  errorComponent: () => <Section><Empty title="Something went wrong loading this page" /></Section>,
  component: Page,
});

function Page() {
  const { partner, provider } = Route.useLoaderData();
  // Record UTM params, referrer and the partner slug so the lead can be attributed.
  useEffect(() => { captureAttribution({ partner: partner.slug, partner_provider: provider.slug }); }, [partner.slug, provider.slug]);
  const review = reviewsFor(provider.slug)[0];
  const consentText = `I agree to share my details with ${provider.name} so they can contact me. Hospitalityservis may receive a fee for the introduction.`;
  const { busy, sent, err, onSubmit } = useSubmit((fd) => submitLead({
    type: "demo", product: provider.name, name: str(fd, "name"), email: str(fd, "email"), restaurant: str(fd, "restaurant"),
    phone: str(fd, "phone"), city: str(fd, "city"), consent: bool(fd, "consent"), consent_text: consentText, company_url: str(fd, "company_url"),
  }));
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2"><Eyebrow>Partner introduction</Eyebrow><Sample /></div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{partner.headline}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{partner.sub}</p>
            <ul className="mt-8 space-y-3">
              {partner.benefits.map((b) => <li key={b} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{b}</li>)}
            </ul>
            {review && (
              <Card className="mt-10 max-w-xl p-5">
                <div className="flex items-center justify-between"><Stars value={review.rating} /><Sample /></div>
                <div className="mt-3 font-semibold">{review.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{review.author} · {review.role} · {review.business}</div>
              </Card>
            )}
            <p className="mt-6 text-sm"><Link to="/software/$slug" params={{ slug: provider.slug }} className="text-primary hover:underline">Read all reviews of {provider.name}</Link></p>
          </Reveal>
          <Card className="h-fit p-6 sm:p-8">
            <h2 className="text-2xl font-bold">{partner.cta}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Free for operators. No obligation to switch.</p>
            <div className="mt-5">
              {sent ? <Sent mode={sent}>Request received for {provider.name}.</Sent> : (
                <form onSubmit={onSubmit} noValidate className="relative grid gap-3">
                  <Honeypot />
                  <input name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
                  <input name="restaurant" maxLength={120} placeholder="Restaurant or business" className={inputCls} />
                  <input name="email" required type="email" maxLength={255} placeholder="Email" className={inputCls} />
                  <input name="phone" type="tel" maxLength={40} placeholder="Phone (optional)" className={inputCls} />
                  <input name="city" maxLength={120} placeholder="City, State" className={inputCls} />
                  <label className="flex items-start gap-2 text-sm text-muted-foreground"><input name="consent" type="checkbox" className="mt-1 accent-[var(--primary)]" />{consentText}</label>
                  <FormError message={err} />
                  <div><Btn type="submit">{busy ? "Sending..." : partner.cta}</Btn></div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </section>
      <Section className="py-8 md:py-8"><AffiliateNote /></Section>
    </>
  );
}
