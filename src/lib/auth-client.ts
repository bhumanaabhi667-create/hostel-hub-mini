import { createAuthClient } from "@neon/neon-js/auth";
import { BetterAuthReactAdapter } from "@neon/neon-js/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  throw new Error("NEON_AUTH_BASE_URL must be configured for client authentication.");
}

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter({
    fetchOptions: { credentials: "include" },
  }),
});
