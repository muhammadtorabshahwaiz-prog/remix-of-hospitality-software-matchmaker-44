import { useEffect } from "react";
import { useParams } from "react-router";
import { Check } from "lucide-react";
import { LeadDialog, SampleBadge, Stars } from "@/components/marketplace";
import { getPartner } from "@/data/partners";
import { getProvider } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import { useTrack } from "@/hooks/useTrack";
import NotFound from "./NotFound";

export default function Partner() {
  const { slug = "" } = useParams();
  const partner = getPartner(slug);
  const provider = partner ? getProvider(partner.provider) : undefined;
  const track = useTrack();
  useEffect(() => { if (partner) track("partner_view", partner.slug); }, [partner, track]);
  usePageTitle(partner?.headline || "Partner page not found", partner?.sub);
  if (!partner || !provider) return <NotFound />;
  return <div className="site-container grid min-h-[80dvh] gap-12 py-16 lg:grid-cols-12 lg:items-center lg:py-24"><section className="lg:col-span-7"><p className="mono-label text-primary">Partner introduction · {provider.name}</p><h1 className="display-lg mt-6">{partner.headline}</h1><p className="mt-6 max-w-2xl text-xl text-muted-foreground">{partner.sub}</p><LeadDialog provider={provider}><button type="button" className="btn-primary mt-9">{partner.cta}</button></LeadDialog><p className="mt-4 text-sm text-muted-foreground">No obligation. Your details are shared with {provider.name} only if you consent in the request form.</p></section><aside className="border border-border bg-card p-7 sm:p-9 lg:col-span-5"><div className="flex items-center justify-between"><p className="font-display text-2xl font-bold">{provider.name}</p><SampleBadge /></div><div className="mt-4"><Stars value={provider.score} /></div><div className="mt-7 border-t border-border pt-6">{partner.benefits.map((benefit)=><p key={benefit} className="flex gap-3 border-b border-border py-4 text-muted-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{benefit}</p>)}</div><p className="mono-label mt-6 text-muted-foreground">Sample profile and rating · Partnership template</p></aside></div>;
}
