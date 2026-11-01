import { and, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function findUserByEmail(email: string) {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return rows.at(0);
}

export async function findUserByResetHash(hash: string) {
  const rows = await getDb().select().from(schema.users).where(and(eq(schema.users.resetTokenHash, hash))).limit(1);
  return rows.at(0);
}

export async function updateUser(id: number, set: Partial<typeof schema.users.$inferInsert>) {
  await getDb().update(schema.users).set(set).where(eq(schema.users.id, id));
}
