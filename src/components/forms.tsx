import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Check } from "lucide-react";
import type { SubmitResult } from "@/lib/submit";

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
export const bool = (fd: FormData, k: string) => fd.get(k) === "on";

/** Hidden spam trap. Real people never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Leave this field empty<input name="company_url" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function Sent({ mode, children }: { mode: "preview" | "live"; children: ReactNode }) {
  return (
    <div role="status" className="border border-primary bg-accent p-6 text-primary">
      <div className="flex items-center gap-2"><Check className="h-5 w-5 shrink-0" />{children}</div>
      {mode === "preview" && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Preview mode: saved on this device only. Nothing has been sent to our team yet.
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" />{message}</p>;
}

/** Shared submit state: busy, sent (preview/live), error message. */
export function useSubmit(fn: (fd: FormData) => Promise<SubmitResult>) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"preview" | "live" | null>(null);
  const [err, setErr] = useState<string | undefined>(undefined);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr(undefined);
    const r = await fn(fd);
    setBusy(false);
    if (r.ok) setSent(r.mode); else setErr(r.message);
  };
  return { busy, sent, err, onSubmit };
}
