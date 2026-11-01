# Backend: what is in it and how to go live

**Tables** (created automatically on the first start, no migration step): users, reviews, review_votes, leads, vendor_claims,
saved_products, saved_comparisons, sponsored_slots, subscriptions, site_events. See `api/lib/ensure-schema.ts`.

**API** (`/api/trpc`): auth, account, billing, marketplace (reviews, leads, sponsored slots), vendor (claims, leads, replies),
admin (moderation, leads, claims, sponsored slots, users, stats, CSV export), analytics (anonymous event counter).

**Plain routes:** `/api/health` (database check), `/robots.txt`, `/sitemap.xml` (built from the catalogue, uses PUBLIC_URL).

**Pages:** `/login /signup /forgot-password /reset-password /account /vendor /admin /pricing /go/:slug /embed/:slug` plus the public site.

## To go live
1. Set `DATABASE_URL`, `APP_ID`, `APP_SECRET`, `PUBLIC_URL`, `OWNER_EMAIL` (your email: you become admin when you sign up).
2. Optional: `RESEND_API_KEY` + `EMAIL_FROM` + `CONTACT_INBOX` (real email), `GOOGLE_CLIENT_ID/SECRET`, Stripe keys (see `.env.example`).
3. `npm install`, `npm run build`, `npm start`. Tables are created on start. Check `/api/health`.
4. Sign up with OWNER_EMAIL, open `/admin`.

Notes: the built-in catalogue (97 products, sample reviews) is labelled sample data on purpose. Real reviews and leads arrive through the forms
and are moderated in `/admin`. `npm run seed` is optional and only re-applies the admin role.

## Free hosting (no Lovable needed)
This is a full-stack app (a Node server plus a MySQL database), so it cannot run on Lovable's front-end-only hosting.
1. Database: create a free MySQL-compatible database at TiDB Cloud (Starter plan). Copy its connection string into `DATABASE_URL`
   (TiDB requires a secure connection, so append `?ssl={"minVersion":"TLSv1.2","rejectUnauthorized":true}` if the string has no ssl option).
2. Put this project in its own new GitHub repository.
3. On render.com choose New > Blueprint, pick that repository (`render.yaml` is included), fill in DATABASE_URL, OWNER_EMAIL, PUBLIC_URL.
4. Free Render services sleep after 15 minutes without visitors and take about a minute to wake. Paid plan removes that.
