import { createConnection } from "mysql2/promise";
import { env } from "./env";
import { log } from "./logger";

/**
 * Creates every table the app needs the first time the server starts, and every start after that it does nothing.
 * (CREATE TABLE IF NOT EXISTS.) This is what lets the site go live on a blank database with no manual migration step.
 * Keep it in step with db/schema.ts. For a column added later, run `npm run db:push` once, or add an ALTER here.
 */
const TS = "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP";
const TS_UPD = "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
const ID = "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY";
const UID = "BIGINT UNSIGNED NOT NULL";

export const TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id ${ID}, unionId VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(255), email VARCHAR(320), avatar TEXT,
    role ENUM('user','admin') NOT NULL DEFAULT 'user', createdAt ${TS}, updatedAt ${TS_UPD}, lastSignInAt ${TS},
    passwordHash TEXT, resetTokenHash VARCHAR(64), resetExpiresAt TIMESTAMP NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id ${ID}, providerSlug VARCHAR(120) NOT NULL, userId BIGINT UNSIGNED NULL, reviewerName VARCHAR(100) NOT NULL,
    reviewerEmail VARCHAR(320) NOT NULL, reviewerRole VARCHAR(120), business VARCHAR(160), city VARCHAR(120),
    rating INT NOT NULL, ease INT NOT NULL DEFAULT 0, value INT NOT NULL DEFAULT 0, support INT NOT NULL DEFAULT 0, features INT NOT NULL DEFAULT 0,
    title VARCHAR(160) NOT NULL, body TEXT NOT NULL, pros TEXT, cons TEXT,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending', verifiedAt TIMESTAMP NULL,
    incentivized BOOLEAN NOT NULL DEFAULT FALSE, relationship TEXT, vendorResponse TEXT, respondedAt TIMESTAMP NULL,
    helpfulCount INT NOT NULL DEFAULT 0, createdAt ${TS}, updatedAt ${TS_UPD},
    INDEX reviews_provider_status_idx (providerSlug, status), INDEX reviews_status_idx (status)
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id ${ID}, type ENUM('demo','operator_join','vendor_join','vendor_listing','contact','newsletter') NOT NULL,
    providerSlug VARCHAR(120), name VARCHAR(100) NOT NULL, email VARCHAR(320) NOT NULL, company VARCHAR(160), phone VARCHAR(40),
    city VARCHAR(120), interest VARCHAR(200), notes TEXT, consent BOOLEAN NOT NULL DEFAULT FALSE, consentText VARCHAR(500),
    status ENUM('new','sent','contacted','won','lost') NOT NULL DEFAULT 'new', source VARCHAR(160),
    utmSource VARCHAR(120), utmMedium VARCHAR(120), utmCampaign VARCHAR(120), internalNotes TEXT, createdAt ${TS}, updatedAt ${TS_UPD},
    INDEX leads_provider_idx (providerSlug), INDEX leads_status_idx (status)
  )`,
  `CREATE TABLE IF NOT EXISTS vendor_claims (
    id ${ID}, providerSlug VARCHAR(120) NOT NULL, userId ${UID}, businessEmail VARCHAR(320) NOT NULL, website VARCHAR(300), note TEXT,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending', createdAt ${TS}, updatedAt ${TS_UPD},
    INDEX claims_user_idx (userId), INDEX claims_provider_status_idx (providerSlug, status)
  )`,
  `CREATE TABLE IF NOT EXISTS saved_products (
    id ${ID}, userId ${UID}, providerSlug VARCHAR(120) NOT NULL, createdAt ${TS},
    UNIQUE KEY saved_user_provider_unique (userId, providerSlug)
  )`,
  `CREATE TABLE IF NOT EXISTS sponsored_slots (
    id ${ID}, categorySlug VARCHAR(120) NOT NULL, providerSlug VARCHAR(120) NOT NULL, position INT NOT NULL DEFAULT 1,
    priceCents INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE, startsAt ${TS}, endsAt TIMESTAMP NULL, createdAt ${TS},
    INDEX sponsored_category_active_idx (categorySlug, active)
  )`,
  `CREATE TABLE IF NOT EXISTS saved_comparisons (
    id ${ID}, userId ${UID}, name VARCHAR(120) NOT NULL, slugs VARCHAR(400) NOT NULL, createdAt ${TS},
    INDEX saved_comparisons_user_idx (userId)
  )`,
  `CREATE TABLE IF NOT EXISTS review_votes (
    id ${ID}, reviewId ${UID}, userId ${UID}, createdAt ${TS}, UNIQUE KEY review_votes_unique (reviewId, userId)
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id ${ID}, userId ${UID}, providerSlug VARCHAR(120) NOT NULL, plan VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL,
    stripeCustomerId VARCHAR(80) NOT NULL, stripeSubscriptionId VARCHAR(80) NOT NULL, currentPeriodEnd TIMESTAMP NULL,
    createdAt ${TS}, updatedAt ${TS_UPD}, UNIQUE KEY subscriptions_stripe_unique (stripeSubscriptionId), INDEX subscriptions_user_idx (userId)
  )`,
  `CREATE TABLE IF NOT EXISTS site_events (
    id ${ID}, kind VARCHAR(40) NOT NULL, path VARCHAR(300) NOT NULL, slug VARCHAR(120), source VARCHAR(160),
    utmSource VARCHAR(120), utmMedium VARCHAR(120), utmCampaign VARCHAR(120), createdAt ${TS},
    INDEX site_events_kind_idx (kind, createdAt), INDEX site_events_slug_idx (slug)
  )`,
];

let done: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (done) return done;
  done = (async () => {
    if (!env.databaseUrl) { log.warn("ensureSchema skipped: DATABASE_URL is not set"); return; }
    const conn = await createConnection(env.databaseUrl);
    try {
      for (const statement of TABLES) await conn.query(statement);
      if (env.ownerEmail) await conn.query("UPDATE users SET role = 'admin' WHERE LOWER(email) = ? AND role <> 'admin'", [env.ownerEmail]);
      log.info("database schema is ready", { tables: TABLES.length });
    } finally {
      await conn.end();
    }
  })().catch((error) => {
    done = null; // try again on the next start or call
    log.error("ensureSchema failed", { error: error instanceof Error ? error.message : String(error) });
  });
  return done;
}
