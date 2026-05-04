// REQUIRED: Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard → Settings → Env Variables
// Value format: https://<your-clerk-subdomain>.clerk.accounts.dev
// Derive it from your VITE_CLERK_PUBLISHABLE_KEY: base64-decode the part after "pk_test_"
//
// Example for key pk_test_c3R1bm5pbmcta3JpbGwtODguY2xlcmsuYWNjb3VudHMuZGV2JA:
//   → https://stunning-krill-88.clerk.accounts.dev

const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!domain) {
  throw new Error(
    "[auth.config] CLERK_JWT_ISSUER_DOMAIN is not set in Convex environment variables. " +
    "Go to dashboard.convex.dev → your project → Settings → Environment Variables and add it. " +
    "All authenticated requests will fail until this is configured."
  );
}

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
