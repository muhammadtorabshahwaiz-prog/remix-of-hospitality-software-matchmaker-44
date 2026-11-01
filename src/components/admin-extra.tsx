import { Download, LoaderCircle } from "lucide-react";
import { EmptyState } from "@/components/marketplace";
import { trpc } from "@/providers/trpc";

const KIND_LABEL: Record<string, string> = { partner_view: "Partner page views", outbound_click: "Outbound clicks", compare_start: "Comparisons started", search: "Searches", cta_click: "Button clicks" };

export function AdminTraffic() {
  const stats = trpc.admin.stats.useQuery(undefined, { retry: false });
  if (stats.isLoading) return <div className="py-16 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" /></div>;
  if (stats.error || !stats.data) return <EmptyState title="Traffic could not load">{stats.error?.message ?? "Try again in a moment."}</EmptyState>;
  const d = stats.data;
  const cards: [string, number][] = [["Pending reviews", d.pendingReviews], ["New leads", d.newLeads], ["Pending vendor claims", d.pendingClaims], ["Registered users", d.userCount], ["Active subscriptions", d.activeSubs]];
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">What needs attention, and the last 30 days</h2>
      <p className="mt-2 text-muted-foreground">Traffic counts are anonymous and only recorded for visitors who accepted analytics in the cookie notice.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, n]) => <div key={label} className="slab p-5" data-no-tilt><p className="font-display text-3xl font-bold">{n}</p><p className="mono-label mt-1 text-muted-foreground">{label}</p></div>)}</div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="slab p-5" data-no-tilt><h3 className="font-display text-lg font-bold">Events by type</h3>
          {d.events.length ? <ul className="mt-4 divide-y divide-border">{d.events.map((e) => <li key={e.kind} className="flex justify-between py-2.5"><span>{KIND_LABEL[e.kind] ?? e.kind}</span><span className="font-semibold">{Number(e.n)}</span></li>)}</ul> : <p className="mt-4 text-muted-foreground">No events yet.</p>}
        </div>
        <div className="slab p-5" data-no-tilt><h3 className="font-display text-lg font-bold">Top pages and products</h3>
          {d.topPages.length ? <ul className="mt-4 divide-y divide-border">{d.topPages.map((e, i) => <li key={`${e.slug}-${e.kind}-${i}`} className="flex justify-between gap-3 py-2.5"><span className="min-w-0 truncate">{e.slug} <span className="text-muted-foreground">· {KIND_LABEL[e.kind] ?? e.kind}</span></span><span className="font-semibold">{Number(e.n)}</span></li>)}</ul> : <p className="mt-4 text-muted-foreground">No events yet.</p>}
        </div>
      </div>
    </section>
  );
}

export function AdminUsers() {
  const utils = trpc.useUtils();
  const users = trpc.admin.users.useQuery(undefined, { retry: false });
  const setRole = trpc.admin.setUserRole.useMutation({ onSuccess: () => utils.admin.users.invalidate() });
  if (users.isLoading) return <div className="py-16 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" /></div>;
  if (users.error) return <EmptyState title="Users could not load">{users.error.message}</EmptyState>;
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">Users</h2>
      <p className="mt-2 text-muted-foreground">Everyone who has an account. Give someone admin access, or take it away.</p>
      {setRole.error && <p role="alert" className="mt-4 text-sm text-destructive">{setRole.error.message}</p>}
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 pr-4 font-semibold">Name</th><th className="py-2 pr-4 font-semibold">Email</th><th className="py-2 pr-4 font-semibold">Joined</th><th className="py-2 font-semibold">Role</th></tr></thead>
        <tbody>{users.data?.map((u) => <tr key={u.id} className="border-b border-border"><td className="py-3 pr-4">{u.name || "—"}</td><td className="py-3 pr-4">{u.email || "—"}</td><td className="py-3 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
          <td className="py-3"><select value={u.role} disabled={setRole.isPending} onChange={(e) => setRole.mutate({ id: Number(u.id), role: e.target.value as "user" | "admin" })} className="field !min-h-10 !w-auto !py-1" aria-label={`Role for ${u.email ?? u.name ?? u.id}`}><option value="user">User</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div>
    </section>
  );
}

export function ExportLeadsButton() {
  const utils = trpc.useUtils();
  const download = async () => {
    const { csv } = await utils.admin.exportLeads.fetch();
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <button type="button" onClick={() => void download()} className="btn-secondary mt-4"><Download className="h-4 w-4" />Download leads (CSV)</button>;
}
