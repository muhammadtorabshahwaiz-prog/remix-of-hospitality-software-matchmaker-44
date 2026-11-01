import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { AuthShell, FormError, GoogleButton, OrDivider } from "@/components/auth-shell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const forgot = trpc.auth.forgotPassword.useMutation();

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={<Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>}
    >
      {forgot.isSuccess ? (
        <div className="space-y-3 text-sm">
          <p className="rounded-xl border border-border bg-secondary px-4 py-3">If an account exists for that email, a reset link is on its way. The link works for one hour.</p>
          {forgot.data?.devLink && (
            <p className="rounded-xl border border-dashed border-primary/50 px-4 py-3 text-xs text-muted-foreground">
              Development mode: no email service is connected, so here is the link: <Link to={forgot.data.devLink.replace(/^https?:\/\/[^/]+/, "")} className="break-all text-primary underline">open reset page</Link>
            </p>
          )}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); forgot.mutate({ email }); }}>
          <FormError message={forgot.error?.message} />
          <label className="block text-sm font-medium">Email
            <input className="field mt-1.5" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={forgot.isPending}>{forgot.isPending ? "Sending..." : "Send reset link"}</button>
        </form>
      )}
    </AuthShell>
  );
}
