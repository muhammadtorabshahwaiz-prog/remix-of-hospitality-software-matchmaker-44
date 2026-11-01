import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { AuthShell, FormError, GoogleButton, OrDivider } from "@/components/auth-shell";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const utils = trpc.useUtils();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const reset = trpc.auth.resetPassword.useMutation({
    onSuccess: async () => { await utils.invalidate(); navigate("/"); },
  });

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick a password you have not used before."
      footer={<Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>}
    >
      {!token ? (
        <FormError message="This reset link is incomplete. Request a new one from the forgot-password page." />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (password !== confirm) { setLocalError("The two passwords do not match."); return; }
            setLocalError(null);
            reset.mutate({ token, password });
          }}
        >
          <FormError message={localError ?? reset.error?.message} />
          <label className="block text-sm font-medium">New password
            <input className="field mt-1.5" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Confirm new password
            <input className="field mt-1.5" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={reset.isPending}>{reset.isPending ? "Saving..." : "Save new password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
