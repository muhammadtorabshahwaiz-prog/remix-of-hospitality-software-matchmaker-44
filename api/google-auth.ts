import type { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import * as jose from "jose";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";
import { newToken } from "./lib/password";

const STATE_COOKIE = "g_state";

/** Sign in with Google. Only active when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set. */
export function registerGoogleAuth(app: Hono<any>) {
  const redirectUri = (c: any) => `${env.publicUrl || new URL(c.req.url).origin}/api/auth/google/callback`;
  const enabled = () => !!(env.googleClientId && env.googleClientSecret);

  app.get("/api/auth/google", (c) => {
    if (!enabled()) return c.redirect("/login?error=google_not_configured", 302);
    const state = newToken();
    setCookie(c, STATE_COOKIE, state, { httpOnly: true, path: "/", sameSite: "Lax", maxAge: 600, secure: !!env.isProduction });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", env.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri(c));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return c.redirect(url.toString(), 302);
  });

  app.get("/api/auth/google/callback", async (c) => {
    const fail = (why: string) => c.redirect(`/login?error=${why}`, 302);
    if (!enabled()) return fail("google_not_configured");
    const code = c.req.query("code");
    const state = c.req.query("state");
    const saved = getCookie(c, STATE_COOKIE);
    deleteCookie(c, STATE_COOKIE, { path: "/" });
    if (c.req.query("error") || !code || !state || !saved || state !== saved) return fail("google_failed");
    try {
      const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.googleClientId,
          client_secret: env.googleClientSecret,
          redirect_uri: redirectUri(c),
          grant_type: "authorization_code",
        }),
      });
      if (!resp.ok) return fail("google_failed");
      const { id_token } = (await resp.json()) as { id_token?: string };
      if (!id_token) return fail("google_failed");
      // The token came straight from Google over TLS in exchange for our one-time code.
      const claims = jose.decodeJwt(id_token) as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
      if (!claims.sub || !claims.email || claims.email_verified === false) return fail("google_failed");
      const unionId = `google:${claims.sub}`;
      const mail = claims.email.toLowerCase();
      await upsertUser({
        unionId,
        name: claims.name ?? mail,
        email: mail,
        avatar: claims.picture,
        role: mail === env.ownerEmail ? "admin" : undefined,
        lastSignInAt: new Date(),
      });
      const token = await signSessionToken({ unionId, clientId: env.appId });
      setCookie(c, Session.cookieName, token, { ...getSessionCookieOptions(c.req.raw.headers), maxAge: Session.maxAgeMs / 1000 });
      return c.redirect("/", 302);
    } catch (e) {
      console.warn("[auth] Google sign-in failed:", e);
      return fail("google_failed");
    }
  });
}
