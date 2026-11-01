import type { ReactNode } from "react";
import { Link } from "react-router";

/** Shared frame for the sign-in, sign-up and password pages. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="site-container flex min-h-[calc(100dvh-140px)] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-7 shadow-xl backdrop-blur sm:p-9">
        <Link to="/" className="mono-label text-primary">Hospitalityservis</Link>
        <h1 className="display-md mt-4">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</p>;
}

export function GoogleButton() {
  return (
    <a href="/api/auth/google" className="btn-secondary w-full">
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 7 8.9 4.8 12 4.8Z"/></svg>
      Continue with Google
    </a>
  );
}

export function OrDivider() {
  return <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>;
}
