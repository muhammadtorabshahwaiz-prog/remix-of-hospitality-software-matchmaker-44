import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { hashPassword, verifyPassword, sha256, newToken } from "./lib/password";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";
import { findUserByEmail, findUserByResetHash, updateUser } from "./queries/local-users";
import type { TrpcContext } from "./context";
import { sendMail, escapeHtml } from "./lib/mailer";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(320);
const password = z.string().min(8, "Use at least 8 characters.").max(200);

async function startSession(ctx: TrpcContext, unionId: string) {
  const token = await signSessionToken({ unionId, clientId: env.appId });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export const authRouter = createRouter({
  me: publicQuery.query((opts) => {
    const u = opts.ctx.user;
    if (!u) return null;
    // never send credential fields to the browser
    const { passwordHash: _p, resetTokenHash: _r, resetExpiresAt: _e, ...safe } = u;
    return safe;
  }),

  providers: publicQuery.query(() => ({ google: !!(env.googleClientId && env.googleClientSecret) })),

  signUp: publicQuery
    .input(z.object({ name: z.string().trim().min(1, "Enter your name.").max(100), email, password }))
    .mutation(async ({ input, ctx }) => {
      if (await findUserByEmail(input.email)) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists. Try signing in." });
      }
      const unionId = `local:${crypto.randomUUID()}`;
      await upsertUser({
        unionId,
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: input.email === env.ownerEmail ? "admin" : undefined,
        lastSignInAt: new Date(),
      });
      await startSession(ctx, unionId);
      return { success: true };
    }),

  signIn: publicQuery
    .input(z.object({ email, password: z.string().min(1, "Enter your password.").max(200) }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      // same message for unknown email and wrong password, so the form does not reveal which accounts exist
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      }
      await updateUser(user.id, { lastSignInAt: new Date() });
      await startSession(ctx, user.unionId);
      return { success: true };
    }),

  forgotPassword: publicQuery.input(z.object({ email })).mutation(async ({ input, ctx }) => {
    const user = await findUserByEmail(input.email);
    let devLink: string | undefined;
    if (user) {
      const token = newToken();
      await updateUser(user.id, { resetTokenHash: sha256(token), resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) });
      const origin = env.publicUrl || new URL(ctx.req.url).origin;
      const link = `${origin}/reset-password?token=${token}`;
      const sent = await sendMail({
        to: input.email,
        subject: "Reset your Hospitalityservis password",
        text: `Use this link to choose a new password. It works for one hour.\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
        html: `<p>Use this link to choose a new password. It works for one hour.</p><p><a href="${escapeHtml(link)}">Choose a new password</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
      });
      if (!sent && !env.isProduction) devLink = link; // email not configured: show the link while developing
    }
    // always the same answer, whether or not the account exists
    return { success: true, devLink };
  }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string().min(20).max(200), password }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByResetHash(sha256(input.token));
      if (!user || !user.resetExpiresAt || user.resetExpiresAt.getTime() < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has expired. Request a new one." });
      }
      await updateUser(user.id, { passwordHash: hashPassword(input.password), resetTokenHash: null, resetExpiresAt: null, lastSignInAt: new Date() });
      await startSession(ctx, user.unionId);
      return { success: true };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
