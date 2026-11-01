import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export function HelpfulButton({ id, count }: { id: number; count: number }) {
  const { isAuthenticated } = useAuth();
  const [n, setN] = useState(count);
  const [voted, setVoted] = useState(false);
  const vote = trpc.marketplace.voteHelpful.useMutation({ onSuccess: (r) => { setN(r.helpfulCount); setVoted(r.voted); } });
  if (!isAuthenticated) return <Link to="/login" className="mono-label mt-5 inline-flex items-center gap-2 text-muted-foreground hover:text-primary"><ThumbsUp className="h-3.5 w-3.5" />Helpful ({n}), sign in to vote</Link>;
  return (
    <button type="button" aria-pressed={voted} disabled={vote.isPending} onClick={() => vote.mutate({ id })} className={`mono-label mt-5 inline-flex items-center gap-2 ${voted ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
      <ThumbsUp className="h-3.5 w-3.5" />Helpful ({n}){vote.error ? `: ${vote.error.message}` : ""}
    </button>
  );
}
