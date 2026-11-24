import { apiFetch } from "@/lib/api";
import type { HomeReadyFieldErrors } from "@repo/shared/homeready";

/**
 * Calls behind the /register page (server: routes/homeready.route.ts).
 * Errors are shown inline on the form, so the shared toast is off.
 */

export type HomeReadyError = {
  code: string;
  message: string;
  fields?: HomeReadyFieldErrors;
  retryAfterSeconds?: number;
};

export type HomeReadyResult<T> = { ok: true; data: T } | { ok: false; error: HomeReadyError };

const NETWORK_ERROR: HomeReadyError = {
  code: "NETWORK",
  message: "We couldn't reach our server. Please check your connection and try again."
};

async function post<T>(path: string, body: unknown): Promise<HomeReadyResult<T>> {
  try {
    const response = await apiFetch(`/homeready${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      notify: false
    });
    const payload = (await response.json().catch(() => null)) as HomeReadyResult<T> | null;
    if (!payload || typeof payload.ok !== "boolean") {
      return { ok: false, error: { code: "BAD_RESPONSE", message: "Something went wrong. Please try again." } };
    }
    return payload;
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

export type RegisterRequest = {
  legalName: string;
  preferredName: string;
  email: string;
  phone: string;
  applicationType: string;
  consent: boolean;
  /** Honeypot. */
  website: string;
  utmSource: string | null;
  utmCampaign: string | null;
};

export function registerInterest(body: RegisterRequest) {
  return post<{ pendingId: string; resendAfterSeconds: number; expiresInSeconds: number }>("/register", body);
}

export function verifyCode(pendingId: string, code: string) {
  return post<{ name: string }>("/verify", { pendingId, code });
}

export function resendCode(pendingId: string) {
  return post<{ resendAfterSeconds: number; expiresInSeconds: number }>("/resend", { pendingId });
}
