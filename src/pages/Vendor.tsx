import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, BarChart3, Bookmark, Check, Download, Inbox, LoaderCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { EmptyState, ProviderRow, SampleBadge } from "@/components/marketplace";
import { BillingPanel } from "@/components/billing-panel";
import { PROVIDERS, getProvider } from "@/data/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

const tabs = [["overview", "Overview"], ["billing", "Billing"], ["leads", "Leads"], ["reviews", "Reviews"], ["saved", "Saved products"], ["claims", "Profile claims"]] as const;
type Tab = typeof tabs[number][0];

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export default function Vendor() {
  usePageTitle("Vendor workspace");
  const { isAuthenticated, isLoading, user } = useAuth({ redirectOnUnauthenticated: true });
  const [params, setParams] = useSearchParams();
  const initialClaim = params.get("claim") || "";
  const [tab, setTab] = useState<Tab>(initialClaim ? "claims" : params.get("tab") === "billing" ? "billing" : "overview");
  const utils = trpc.useUtils();
  const dashboard = trpc.vendor.dashboard.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const invalidate = async () => { await utils.vendor.dashboard.invalidate(); };
  const claimMutation = trpc.vendor.claim.useMutation({ onSuccess: invalidate });
  const leadMutation = trpc.vendor.updateLead.useMutation({ onSuccess: invalidate });
  const replyMutation = trpc.vendor.replyToReview.useMutation({ onSuccess: invalidate });
  const [claimMessage, setClaimMessage] = useState("");
  const [replyId, setReplyId] = useState<number | null>(null);
  const data = dashboard.data;
  const stats = useMemo(() => {
    const leads = data?.leads || [];
    const won = leads.filter((lead) => lead.status === "won").length;
    return { leads: leads.length, fresh: leads.filter((lead) => lead.status === "new").length, won, conversion: leads.length ? Math.round(won / leads.length * 100) : 0 };
  }, [data]);

  if (isLoading || !isAuthenticated) return <div className="site-container flex min-h-[70dvh] items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-primary" /><span className="sr-only">Loading workspace</span></div>;

  const submitClaim = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClaimMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await claimMutation.mutateAsync({ providerSlug: String(form.get("providerSlug") || ""), businessEmail: String(form.get("businessEmail") || ""), website: String(form.get("website") || ""), note: String(form.get("note") || "") });
      setClaimMessage("Claim submitted. It is now pending administrator approval.");
      params.delete("claim"); setParams(params, { replace: true });
    } catch (cause) { setClaimMessage(cause instanceof Error ? cause.message : "Unable to submit claim."); }
  };

  const exportLeads = () => {
    const rows = [["Product", "Name", "Email", "Company", "Phone", "Status", "Created"], ...(data?.leads || []).map((lead) => [getProvider(lead.providerSlug || "")?.name || lead.providerSlug, lead.name, lead.email, lead.company, lead.phone, lead.status, new Date(lead.createdAt).toISOString()])];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "hospitalityservis-leads.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="site-container py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8"><div><p className="mono-label text-primary">Authenticated workspace</p><h1 className="display-md mt-4">Welcome, {user?.name || "vendor"}.</h1><p className="mt-3 text-muted-foreground">Manage approved provider leads, review responses, claims, and your saved shortlist.</p></div><button type="button" onClick={() => setTab("claims")} className="btn-primary">Claim a profile <ArrowRight className="h-4 w-4" /></button></div>
      <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Workspace sections">{tabs.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`min-h-12 shrink-0 border-b-2 px-4 font-mono text-[11px] uppercase tracking-wider ${tab === value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</button>)}</div>
      {dashboard.isLoading ? <div className="py-24 text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-primary" /></div> : dashboard.error ? <div className="mt-8"><EmptyState title="Workspace could not load">{dashboard.error.message}</EmptyState></div> : (
        <div className="py-8">
          {tab === "overview" && <section><div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">{[[Inbox,"Total leads",stats.leads],[BarChart3,"New leads",stats.fresh],[Check,"Won",stats.won],[BarChart3,"Conversion",`${stats.conversion}%`]].map(([Icon,label,value])=>{const I=Icon as typeof Inbox;return <div key={String(label)} className="bg-background p-6"><I className="h-5 w-5 text-primary" /><p className="mt-5 font-display text-4xl font-extrabold">{String(value)}</p><p className="mono-label mt-2 text-muted-foreground">{String(label)}</p></div>})}</div><div className="mt-12 grid gap-10 lg:grid-cols-2"><div><h2 className="font-display text-2xl font-bold">Approved profiles</h2>{data?.claims.filter((claim)=>claim.status==="approved").length ? <div className="mt-5 border-t border-border">{data.claims.filter((claim)=>claim.status==="approved").map((claim)=><Link key={claim.id} to={`/software/${claim.providerSlug}`} className="data-row flex items-center justify-between px-4 py-5"><span className="font-display font-bold">{getProvider(claim.providerSlug)?.name || claim.providerSlug}</span><span className="mono-label text-primary">Approved</span></Link>)}</div> : <p className="mt-4 text-muted-foreground">No approved provider claims yet. Submit a claim to unlock lead and review tools.</p>}</div><div><h2 className="font-display text-2xl font-bold">Lead pipeline</h2><div className="mt-6 space-y-4">{["new","sent","contacted","won","lost"].map((status)=>{const count=data?.leads.filter((lead)=>lead.status===status).length||0;const width=stats.leads?Math.max(2,count/stats.leads*100):0;return <div key={status} className="grid grid-cols-[90px_1fr_30px] items-center gap-3"><span className="mono-label text-muted-foreground">{status}</span><div className="h-2 bg-secondary"><div className="h-full bg-primary" style={{width:`${width}%`}} /></div><span className="font-mono text-xs">{count}</span></div>})}</div></div></div></section>}

          {tab === "leads" && <section><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Lead inbox</h2><p className="mt-2 text-muted-foreground">Only leads for your approved provider profiles appear here.</p></div>{data?.leads.length ? <button type="button" onClick={exportLeads} className="btn-secondary"><Download className="h-4 w-4" />Export CSV</button> : null}</div>{data?.leads.length ? <div className="mt-8 border-t border-border">{data.leads.map((lead)=><article key={lead.id} className="grid gap-5 border-b border-border py-6 lg:grid-cols-[1fr_1fr_170px] lg:items-center"><div><p className="font-display text-lg font-bold">{lead.name} <span className="font-normal text-muted-foreground">· {lead.company || "Independent"}</span></p><p className="mt-1 text-sm text-muted-foreground">{getProvider(lead.providerSlug||"")?.name} · {lead.interest || lead.type}</p>{lead.notes&&<p className="mt-3 text-sm">{lead.notes}</p>}</div><div className="text-sm"><a href={`mailto:${lead.email}`} className="link-underline text-primary">{lead.email}</a>{lead.phone&&<p className="mt-1 text-muted-foreground">{lead.phone}</p>}<p className="mt-2 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleString()}</p></div><label className="text-sm">Status<select value={lead.status} disabled={leadMutation.isPending} onChange={(event)=>leadMutation.mutate({id:lead.id,status:event.target.value as typeof lead.status})} className="field mt-2">{["new","sent","contacted","won","lost"].map((status)=><option key={status}>{status}</option>)}</select></label></article>)}</div> : <div className="mt-8"><EmptyState title="No leads yet">Leads appear after buyers request an introduction to a provider profile you manage.</EmptyState></div>}</section>}

          {tab === "reviews" && <section><h2 className="font-display text-2xl font-bold">Review responses</h2><p className="mt-2 text-muted-foreground">You can respond publicly to approved reviews. You cannot edit or delete reviewer content.</p>{data?.reviews.length ? <div className="mt-8 border-t border-border">{data.reviews.map((review)=><article key={review.id} className="border-b border-border py-7"><div className="flex flex-wrap items-center gap-3"><span className="font-mono text-primary">{review.rating}/5</span><span className="mono-label text-muted-foreground">{review.status}</span>{review.verifiedAt&&<span className="mono-label text-primary">Verified</span>}</div><h3 className="mt-3 font-display text-xl font-bold">{review.title}</h3><p className="mt-2 text-muted-foreground">{review.body}</p><p className="mono-label mt-4 text-muted-foreground">{review.reviewerName} · {getProvider(review.providerSlug)?.name}</p>{review.vendorResponse ? <div className="mt-5 border-l border-primary pl-5"><p className="mono-label text-primary">Your response</p><p className="mt-2">{review.vendorResponse}</p></div> : review.status === "approved" && (replyId === review.id ? <form onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);replyMutation.mutate({id:review.id,response:String(form.get("response")||"")},{onSuccess:()=>setReplyId(null)});}} className="mt-5"><textarea name="response" required minLength={3} maxLength={2000} rows={4} className="field resize-y" placeholder="Write a professional public response…" /><div className="mt-3 flex gap-2"><button type="submit" disabled={replyMutation.isPending} className="btn-primary">Publish response</button><button type="button" onClick={()=>setReplyId(null)} className="btn-secondary">Cancel</button></div></form> : <button type="button" onClick={()=>setReplyId(review.id)} className="btn-secondary mt-5"><MessageSquare className="h-4 w-4" />Respond publicly</button>)}</article>)}</div> : <div className="mt-8"><EmptyState title="No reviews to manage">Reviews for your approved profiles will appear here after submission.</EmptyState></div>}</section>}

          {tab === "saved" && <section><div className="flex items-center gap-3"><Bookmark className="h-5 w-5 text-primary" /><h2 className="font-display text-2xl font-bold">Saved products</h2></div>{data?.saved.length ? <div className="mt-8 border-t border-border">{data.saved.map((item)=>{const provider=getProvider(item.providerSlug);return provider?<ProviderRow key={item.id} provider={provider}/>:null})}</div> : <div className="mt-8"><EmptyState title="No saved products">Use Save on any product profile to build a persistent shortlist across devices.</EmptyState></div>}</section>}

          {tab === "billing" && <BillingPanel />}
          {tab === "claims" && <section className="grid gap-12 lg:grid-cols-[1fr_380px]"><div><h2 className="font-display text-2xl font-bold">Your profile claims</h2>{data?.claims.length ? <div className="mt-6 border-t border-border">{data.claims.map((claim)=><div key={claim.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-5"><div><p className="font-display font-bold">{getProvider(claim.providerSlug)?.name||claim.providerSlug}</p><p className="text-sm text-muted-foreground">{claim.businessEmail}</p></div><span className={`mono-label ${claim.status==="approved"?"text-primary":"text-muted-foreground"}`}>{claim.status}</span></div>)}</div>:<p className="mt-4 text-muted-foreground">No claims submitted yet.</p>}<div className="mt-8 flex gap-3 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p>Claims require administrator approval. Approved claims determine which leads and review responses you can access.</p></div></div><form onSubmit={submitClaim} className="h-fit border border-border bg-card p-6"><p className="mono-label text-primary">New claim</p><h2 className="mt-3 font-display text-2xl font-bold">Claim a provider profile.</h2><label className="mt-6 block text-sm font-semibold">Product<select name="providerSlug" required defaultValue={initialClaim} className="field mt-2"><option value="" disabled>Choose a product</option>{PROVIDERS.map((provider)=><option key={provider.slug} value={provider.slug}>{provider.name}</option>)}</select></label><label className="mt-5 block text-sm font-semibold">Business email<input name="businessEmail" required type="email" defaultValue={user?.email||""} className="field mt-2" /></label><label className="mt-5 block text-sm font-semibold">Company website<input name="website" type="url" className="field mt-2" placeholder="https://" /></label><label className="mt-5 block text-sm font-semibold">Verification note<textarea name="note" rows={3} maxLength={1500} className="field mt-2 resize-y" placeholder="Your role and connection to the company" /></label>{claimMessage&&<p role="status" className="mt-4 border border-primary/40 bg-primary/10 p-3 text-sm text-primary">{claimMessage}</p>}<button type="submit" disabled={claimMutation.isPending} className="btn-primary mt-6 w-full">Submit for approval</button></form></section>}
        </div>
      )}
      <div className="mt-6"><SampleBadge /></div>
    </div>
  );
}
