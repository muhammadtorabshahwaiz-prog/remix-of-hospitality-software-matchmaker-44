import {
  bigint,
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  passwordHash: text("passwordHash"),
  resetTokenHash: varchar("resetTokenHash", { length: 64 }),
  resetExpiresAt: timestamp("resetExpiresAt"),
});

export const reviews = mysqlTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    providerSlug: varchar("providerSlug", { length: 120 }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    reviewerName: varchar("reviewerName", { length: 100 }).notNull(),
    reviewerEmail: varchar("reviewerEmail", { length: 320 }).notNull(),
    reviewerRole: varchar("reviewerRole", { length: 120 }),
    business: varchar("business", { length: 160 }),
    city: varchar("city", { length: 120 }),
    rating: int("rating").notNull(),
    ease: int("ease").default(0).notNull(),
    value: int("value").default(0).notNull(),
    support: int("support").default(0).notNull(),
    features: int("features").default(0).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    pros: text("pros"),
    cons: text("cons"),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    verifiedAt: timestamp("verifiedAt"),
    incentivized: boolean("incentivized").default(false).notNull(),
    relationship: text("relationship"),
    vendorResponse: text("vendorResponse"),
    respondedAt: timestamp("respondedAt"),
    helpfulCount: int("helpfulCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [
    index("reviews_provider_status_idx").on(table.providerSlug, table.status),
    index("reviews_status_idx").on(table.status),
  ],
);

export const leads = mysqlTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    type: mysqlEnum("type", ["demo", "operator_join", "vendor_join", "vendor_listing", "contact", "newsletter"]).notNull(),
    providerSlug: varchar("providerSlug", { length: 120 }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    city: varchar("city", { length: 120 }),
    interest: varchar("interest", { length: 200 }),
    notes: text("notes"),
    consent: boolean("consent").default(false).notNull(),
    consentText: varchar("consentText", { length: 500 }),
    status: mysqlEnum("status", ["new", "sent", "contacted", "won", "lost"]).default("new").notNull(),
    source: varchar("source", { length: 160 }),
    utmSource: varchar("utmSource", { length: 120 }),
    utmMedium: varchar("utmMedium", { length: 120 }),
    utmCampaign: varchar("utmCampaign", { length: 120 }),
    internalNotes: text("internalNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [
    index("leads_provider_idx").on(table.providerSlug),
    index("leads_status_idx").on(table.status),
  ],
);

export const vendorClaims = mysqlTable(
  "vendor_claims",
  {
    id: serial("id").primaryKey(),
    providerSlug: varchar("providerSlug", { length: 120 }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    businessEmail: varchar("businessEmail", { length: 320 }).notNull(),
    website: varchar("website", { length: 300 }),
    note: text("note"),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [
    index("claims_user_idx").on(table.userId),
    index("claims_provider_status_idx").on(table.providerSlug, table.status),
  ],
);

export const savedProducts = mysqlTable(
  "saved_products",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    providerSlug: varchar("providerSlug", { length: 120 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("saved_user_provider_unique").on(table.userId, table.providerSlug)],
);

export const sponsoredSlots = mysqlTable(
  "sponsored_slots",
  {
    id: serial("id").primaryKey(),
    categorySlug: varchar("categorySlug", { length: 120 }).notNull(),
    providerSlug: varchar("providerSlug", { length: 120 }).notNull(),
    position: int("position").default(1).notNull(),
    priceCents: int("priceCents").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    startsAt: timestamp("startsAt").defaultNow().notNull(),
    endsAt: timestamp("endsAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("sponsored_category_active_idx").on(table.categorySlug, table.active)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ReviewRecord = typeof reviews.$inferSelect;
export type LeadRecord = typeof leads.$inferSelect;
export type VendorClaimRecord = typeof vendorClaims.$inferSelect;
export type SavedProductRecord = typeof savedProducts.$inferSelect;
export type SponsoredSlotRecord = typeof sponsoredSlots.$inferSelect;

export const savedComparisons = mysqlTable(
  "saved_comparisons",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    slugs: varchar("slugs", { length: 400 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("saved_comparisons_user_idx").on(table.userId)],
);

export const reviewVotes = mysqlTable(
  "review_votes",
  {
    id: serial("id").primaryKey(),
    reviewId: bigint("reviewId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("review_votes_unique").on(table.reviewId, table.userId)],
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    providerSlug: varchar("providerSlug", { length: 120 }).notNull(),
    plan: varchar("plan", { length: 40 }).notNull(),
    status: varchar("status", { length: 40 }).notNull(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 80 }).notNull(),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 80 }).notNull(),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("subscriptions_stripe_unique").on(table.stripeSubscriptionId), index("subscriptions_user_idx").on(table.userId)],
);

/** First-party, cookie-free traffic events: partner page views, outbound clicks, comparisons started, searches. */
export const siteEvents = mysqlTable(
  "site_events",
  {
    id: serial("id").primaryKey(),
    kind: varchar("kind", { length: 40 }).notNull(),
    path: varchar("path", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 120 }),
    source: varchar("source", { length: 160 }),
    utmSource: varchar("utmSource", { length: 120 }),
    utmMedium: varchar("utmMedium", { length: 120 }),
    utmCampaign: varchar("utmCampaign", { length: 120 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("site_events_kind_idx").on(table.kind, table.createdAt), index("site_events_slug_idx").on(table.slug)],
);
export type SiteEventRecord = typeof siteEvents.$inferSelect;
