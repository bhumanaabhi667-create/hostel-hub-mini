import { authClient } from "@/lib/auth-client";

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const sessionResult = await authClient.getSession();
  if (sessionResult.error) {
    throw new Error(sessionResult.error.message ?? "Unable to verify your session.");
  }

  const token = sessionResult.data?.session?.token;
  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const responseText = await response.text();
  const result = responseText ? JSON.parse(responseText) : undefined;

  if (!response.ok) {
    throw new Error(
      result?.statusMessage ?? result?.message ?? `Request failed (${response.status}).`,
    );
  }

  return result as T;
}
