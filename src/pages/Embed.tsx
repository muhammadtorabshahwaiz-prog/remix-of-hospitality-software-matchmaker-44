import { useState } from "react";
import { Link, useParams } from "react-router";
import { Check, Copy } from "lucide-react";
import { SampleBadge, Stars } from "@/components/marketplace";
import { getProvider } from "@/data/site";
import { usePageTitle } from "@/lib/seo";
import NotFound from "./NotFound";

export default function Embed() {
  const { slug = "" } = useParams();
  const provider = getProvider(slug);
  const [copied, setCopied] = useState(false);
  usePageTitle(provider ? `${provider.name} profile badge` : "Badge not found");
  if (!provider) return <NotFound />;
  const code = `<a href="${window.location.origin}/software/${provider.slug}" target="_blank" rel="noopener">${provider.name} on Hospitalityservis</a>`;
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <div className="mx-auto max-w-xl p-4 sm:p-8"><div className="border border-border bg-card p-6"><div className="flex items-center justify-between gap-4"><div><p className="mono-label text-primary">Hospitalityservis profile</p><h1 className="mt-2 font-display text-2xl font-bold">{provider.name}</h1></div><SampleBadge /></div><div className="mt-5"><Stars value={provider.score} /></div><p className="mt-3 text-sm text-muted-foreground">{provider.reviews.toLocaleString()} sample reviews · Illustrative rating</p><Link to={`/software/${provider.slug}`} className="btn-primary mt-6 w-full">View full profile</Link></div><button type="button" onClick={copy} className="btn-secondary mt-4 w-full">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Link code copied" : "Copy simple badge code"}</button><p className="mt-3 text-center text-xs text-muted-foreground">This lightweight link badge avoids third-party scripts and keeps the Sample disclosure intact.</p></div>;
}
