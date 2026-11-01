import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { AuthShell, FormError, GoogleButton, OrDivider } from "@/components/auth-shell";

const ERRORS: Record<string, string> = {
  google_failed: "Google sign-in did not complete. Please try again.",
  google_not_configured: "Google sign-in is not set up on this site yet.",
};

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const utils = trpc.useUtils();
  const providers = trpc.auth.providers.useQuery(undefined, { retry: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: async () => { await utils.invalidate(); navigate(params.get("next") || "/"); },
  });
  const urlError = ERRORS[params.get("error") ?? ""];

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Sign in to write reviews and manage your workspace."
      footer={<>New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); signIn.mutate({ email, password }); }}>
        <FormError message={signIn.error?.message ?? urlError} />
        <label className="block text-sm font-medium">Email
          <input className="field mt-1.5" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          <span className="flex items-center justify-between">Password<Link to="/forgot-password" className="text-xs font-normal text-primary hover:underline">Forgot password?</Link></span>
          <input className="field mt-1.5" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={signIn.isPending}>{signIn.isPending ? "Signing in..." : "Sign in"}</button>
      </form>
      {providers.data?.google && (<><OrDivider /><GoogleButton /></>)}
    </AuthShell>
  );
}
