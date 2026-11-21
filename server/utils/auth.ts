import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { createError, type H3Event } from "nitro/h3";

const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

if (!authBaseUrl) {
  throw new Error("NEON_AUTH_BASE_URL must be configured for server authentication.");
}

const authOrigin = new URL(authBaseUrl).origin;
const jwksUrl = new URL(
  ".well-known/jwks.json",
  `${authBaseUrl.replace(/\/+$/, "")}/`,
);
const jwks = createRemoteJWKSet(jwksUrl);

export async function requireUser(event: H3Event) {
  const authorization = event.req.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Sign in to continue." });
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      algorithms: ["EdDSA"],
      issuer: authOrigin,
      audience: authOrigin,
    }));
  } catch (error) {
    const invalidToken =
      error instanceof errors.JWTExpired ||
      error instanceof errors.JWTClaimValidationFailed ||
      error instanceof errors.JWTInvalid ||
      error instanceof errors.JWSInvalid ||
      error instanceof errors.JWSSignatureVerificationFailed ||
      error instanceof errors.JWKSNoMatchingKey ||
      error instanceof errors.JOSEAlgNotAllowed;

    if (invalidToken) {
      throw createError({ statusCode: 401, statusMessage: "Your session is invalid or expired." });
    }

    throw error;
  }

  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw createError({ statusCode: 401, statusMessage: "Your session is invalid or expired." });
  }

  return { id: payload.sub };
}
