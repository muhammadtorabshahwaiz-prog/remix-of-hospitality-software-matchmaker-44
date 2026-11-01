import { authRouter } from "./auth-router";
import { billingRouter } from "./billing-router";
import { accountRouter } from "./account-router";
import { adminRouter } from "./admin-router";
import { analyticsRouter } from "./analytics-router";
import { marketplaceRouter } from "./marketplace-router";
import { vendorRouter } from "./vendor-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  account: accountRouter,
  billing: billingRouter,
  marketplace: marketplaceRouter,
  vendor: vendorRouter,
  admin: adminRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
