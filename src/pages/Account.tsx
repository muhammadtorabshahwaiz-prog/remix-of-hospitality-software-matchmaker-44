import { useState } from "react";
import { Link, Navigate } from "react-router";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/marketplace";
import { FormError } from "@/components/auth-shell";
import { getProvider } from "@/data/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

const STATUS: Record<string, string> = { pending: "Awaiting moderation", approved: "Published", rejected: "Not published" };

export default function Account() {
  usePageTitle("Your account", "Manage your profile, password, reviews and saved comparisons.");
  const { user, isLoading, logout } = useAuth();
  const utils = trpc.useUtils();
  const reviews = trpc.account.myReviews.useQuery(undefined, { enabled: !!user });
  const comparisons = trpc.account.comparisons.useQuery(undefined, { enabled: !!user });
  const [name, setName] = useState<string | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const rename = trpc.account.updateProfile.useMutation({ onSuccess: () => { void utils.auth.me.invalidate(); } });
  const change = trpc.account.changePassword.useMutation({ onSuccess: () => { setCurrent(""); setNext(""); } });
  const remove = trpc.account.deleteComparison.useMutation({ onSuccess: () => { void utils.account.comparisons.invalidate(); } });

  if (isLoading) return <div className="site-container py-24 text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login?next=/account" replace />;

  return (
    <>
      <PageHeader eyebrow="Your account" title={<>Hello, {user.name || "there"}.</>} breadcrumbs={[{ label: "Account" }]}>
        <p>{user.email}</p>
      </PageHeader>
      <div className="site-container grid gap-10 py-16 lg:grid-cols-2">
        <section aria-labelledby="profile-h" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 id="profile-h" className="font-display text-xl font-bold">Profile</h2>
          <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); rename.mutate({ name: name ?? user.name ?? "" }); }}>
            <FormError message={rename.error?.message} />
            <label className="block text-sm font-medium">Full name
              <input className="field mt-1.5" required value={name ?? user.name ?? ""} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Email
              <input className="field mt-1.5 opacity-70" value={user.email ?? ""} readOnly />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary" disabled={rename.isPending}>{rename.isPending ? "Saving..." : "Save profile"}</button>
              {rename.isSuccess && <span role="status" className="text-sm text-primary">Saved.</span>}
              <button type="button" onClick={logout} className="btn-secondary ml-auto">Sign out</button>
            </div>
          </form>
        </section>

        <section aria-labelledby="pw-h" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 id="pw-h" className="font-display text-xl font-bold">Password</h2>
          <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); change.mutate({ current: current || undefined, password: next }); }}>
            <FormError message={change.error?.message} />
            <label className="block text-sm font-medium">Current password
              <input className="field mt-1.5" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Leave empty if you signed up with Google and have not set one yet.</span>
            </label>
            <label className="block text-sm font-medium">New password
              <input className="field mt-1.5" type="password" autoComplete="new-password" minLength={8} required value={next} onChange={(e) => setNext(e.target.value)} />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary" disabled={change.isPending}>{change.isPending ? "Saving..." : "Change password"}</button>
              {change.isSuccess && <span role="status" className="text-sm text-primary">Password changed.</span>}
            </div>
          </form>
        </section>

        <section aria-labelledby="rev-h" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between"><h2 id="rev-h" className="font-display text-xl font-bold">My reviews</h2><Link to="/write-review" className="text-sm font-semibold text-primary hover:underline">Write a review</Link></div>
          {reviews.data?.length ? (
            <ul className="mt-4 divide-y divide-border">
              {reviews.data.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{getProvider(r.providerSlug)?.name ?? r.providerSlug} · {r.rating}/5 · {STATUS[r.status] ?? r.status}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted-foreground">{reviews.isLoading ? "Loading..." : "You have not written a review yet."}</p>}
        </section>

        <section aria-labelledby="cmp-h" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between"><h2 id="cmp-h" className="font-display text-xl font-bold">Saved comparisons</h2><Link to="/compare" className="text-sm font-semibold text-primary hover:underline">Open compare</Link></div>
          {comparisons.data?.length ? (
            <ul className="mt-4 divide-y divide-border">
              {comparisons.data.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <Link to={`/compare?products=${c.slugs}`} className="font-semibold hover:text-primary">{c.name}</Link>
                  <button type="button" onClick={() => remove.mutate({ id: c.id })} aria-label={`Delete ${c.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted-foreground">{comparisons.isLoading ? "Loading..." : "Nothing saved yet. Use \"Save comparison\" on the compare page."}</p>}
        </section>
      </div>
    </>
  );
}
