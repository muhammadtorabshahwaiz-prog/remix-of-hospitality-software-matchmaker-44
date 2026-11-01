import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  ownerEmail: (process.env.OWNER_EMAIL ?? "").trim().toLowerCase(),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePrices: { pro: process.env.STRIPE_PRICE_PRO ?? "", proYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "" } as Record<string, string>,
  // Empty = Stripe picks every method you enabled in the Dashboard (recommended). Or list them: card,link,paypal,us_bank_account,sepa_debit,...
  stripePaymentMethods: (process.env.STRIPE_PAYMENT_METHODS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  // Optional pay-by links for methods Stripe does not cover. Leave empty and the button becomes "request an invoice".
  payLinks: {
    paypal: process.env.PAY_LINK_PAYPAL ?? "",
    wise: process.env.PAY_LINK_WISE ?? "",
    crypto: process.env.PAY_LINK_CRYPTO ?? "",
    jazzcash: process.env.PAY_LINK_JAZZCASH ?? "",
    easypaisa: process.env.PAY_LINK_EASYPAISA ?? "",
  } as Record<string, string>,
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  contactInbox: process.env.CONTACT_INBOX ?? "",
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/$/, ""),
};
