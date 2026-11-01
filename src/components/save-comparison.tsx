import { useState } from "react";
import { Link } from "react-router";
import { Bookmark, Check } from "lucide-react";
import { getProvider } from "@/data/site";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export function SaveComparison({ slugs }: { slugs: string[] }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [saved, setSaved] = useState(false);
  const save = trpc.account.saveComparison.useMutation({ onSuccess: () => { setSaved(true); void utils.account.comparisons.invalidate(); } });
  if (slugs.length < 2) return null;
  if (!isAuthenticated) return <Link to="/login?next=/compare" className="btn-secondary !min-h-10"><Bookmark className="h-4 w-4" />Sign in to save</Link>;
  const name = slugs.map((s) => getProvider(s)?.name ?? s).join(" vs ");
  return (
    <button type="button" className="btn-secondary !min-h-10" disabled={save.isPending || saved} onClick={() => save.mutate({ name, slugs: slugs.join(",") })}>
      {saved ? <><Check className="h-4 w-4" />Saved to your account</> : <><Bookmark className="h-4 w-4" />{save.isPending ? "Saving..." : "Save comparison"}</>}
    </button>
  );
}
