import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { AuthShell, FormError, GoogleButton, OrDivider } from "@/components/auth-shell";

export default function SignUp() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const providers = trpc.auth.providers.useQuery(undefined, { retry: false });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const signUp = trpc.auth.signUp.useMutation({
    onSuccess: async () => { await utils.invalidate(); navigate("/"); },
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free. Write reviews, save comparisons and claim vendor profiles."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (password !== confirm) { setLocalError("The two passwords do not match."); return; }
          setLocalError(null);
          signUp.mutate({ name, email, password });
        }}
      >
        <FormError message={localError ?? signUp.error?.message} />
        <label className="block text-sm font-medium">Full name
          <input className="field mt-1.5" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Email
          <input className="field mt-1.5" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Password
          <input className="field mt-1.5" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">At least 8 characters.</span>
        </label>
        <label className="block text-sm font-medium">Confirm password
          <input className="field mt-1.5" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={signUp.isPending}>{signUp.isPending ? "Creating account..." : "Create account"}</button>
        <p className="text-center text-xs text-muted-foreground">By continuing you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </form>
      {providers.data?.google && (<><OrDivider /><GoogleButton /></>)}
    </AuthShell>
  );
}
