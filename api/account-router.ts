import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { reviews, savedComparisons } from "@db/schema";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { updateUser } from "./queries/local-users";
import { hashPassword, verifyPassword } from "./lib/password";

const SLUGS = /^[a-z0-9-]+(,[a-z0-9-]+){1,2}$/;

export const accountRouter = createRouter({
  updateProfile: authedQuery
    .input(z.object({ name: z.string().trim().min(1, "Enter your name.").max(100) }))
    .mutation(async ({ ctx, input }) => {
      await updateUser(ctx.user.id, { name: input.name });
      return { success: true };
    }),

  changePassword: authedQuery
    .input(z.object({ current: z.string().max(200).optional(), password: z.string().min(8, "Use at least 8 characters.").max(200) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.passwordHash && !verifyPassword(input.current ?? "", ctx.user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Your current password is incorrect." });
      }
      await updateUser(ctx.user.id, { passwordHash: hashPassword(input.password) });
      return { success: true };
    }),

  myReviews: authedQuery.query(async ({ ctx }) =>
    getDb()
      .select({ id: reviews.id, providerSlug: reviews.providerSlug, rating: reviews.rating, title: reviews.title, status: reviews.status, createdAt: reviews.createdAt })
      .from(reviews)
      .where(eq(reviews.userId, ctx.user.id))
      .orderBy(desc(reviews.createdAt))
      .limit(100),
  ),

  comparisons: authedQuery.query(async ({ ctx }) =>
    getDb().select().from(savedComparisons).where(eq(savedComparisons.userId, ctx.user.id)).orderBy(desc(savedComparisons.createdAt)).limit(50),
  ),

  saveComparison: authedQuery
    .input(z.object({ name: z.string().trim().min(1).max(120), slugs: z.string().regex(SLUGS, "Pick two or three products.") }))
    .mutation(async ({ ctx, input }) => {
      await getDb().insert(savedComparisons).values({ userId: ctx.user.id, name: input.name, slugs: input.slugs });
      return { success: true };
    }),

  deleteComparison: authedQuery.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    await getDb().delete(savedComparisons).where(and(eq(savedComparisons.id, input.id), eq(savedComparisons.userId, ctx.user.id)));
    return { success: true };
  }),
});
