import { ensureSchema } from "../api/lib/ensure-schema";
import { getDb } from "../api/queries/connection";
import { env } from "../api/lib/env";
import { users } from "./schema";
import { eq } from "drizzle-orm";

/**
 * `npm run seed` (optional: the server already creates the tables when it starts).
 * Creates the tables, then makes OWNER_EMAIL an admin if that person has already signed up.
 * It deliberately adds no reviews, leads or sponsored slots: real data should come from real visitors,
 * and the site labels its built-in catalogue as sample data.
 */
async function seed() {
  await ensureSchema();
  if (env.ownerEmail) {
    const result = await getDb().update(users).set({ role: "admin" }).where(eq(users.email, env.ownerEmail));
    console.log(`Admin role applied for ${env.ownerEmail}`, result);
  } else {
    console.log("OWNER_EMAIL is not set: sign up first, then set it and run this again to get admin access.");
  }
  console.log("Done.");
  process.exit(0);
}

seed();
