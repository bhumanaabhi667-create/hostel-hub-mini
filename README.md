# Haven campus living

## Neon PostgreSQL and Managed Better Auth

Managed Better Auth stores account data in Neon's `neon_auth` schema. The app
uses Neon PostgreSQL for student records and facility complaints, scoped to the
signed-in manager.

1. In the Neon Console, enable Managed Better Auth and its JWT plugin for the
   database branch. Add the app's local and deployed origins as trusted domains.
2. Keep the existing `.env.local` and ensure it contains `DATABASE_URL` and
   `NEON_AUTH_BASE_URL` (the Better Auth base URL from the Neon Console).
   `.env.example` shows the required keys without real credentials.
3. Use Node.js 20.19 or newer, then install dependencies with `pnpm install`.
4. Create/update the app tables with `pnpm db:push`.
5. Start the app with `pnpm dev`.

The sign-in screen uses Neon Managed Better Auth email/password registration
and login. `VITE_NEON_AUTH_URL` is mapped from `NEON_AUTH_BASE_URL` at build
time, so make that setting available during the frontend build; only the
public auth URL is exposed to the browser. Keep
`DATABASE_URL` server-side and set both values in deployment configuration.
