import { apiFetch } from "@/lib/api";

/**
 * Website account session. The tokens come from the AXP CRM's Supabase Auth
 * via /api/account/* and live in localStorage; this module is the only thing
 * that reads or writes them. Components use the `useSession()` hook.
 */

export type SessionUser = { id: string; email: string; name: string };

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
  user: SessionUser;
};

export type SessionState =
  | { status: "loading"; user: null }
  | { status: "guest"; user: null }
  | { status: "authenticated"; user: SessionUser };

export type SignUpResult = "signed_in" | "confirm_email";

export class AccountError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AccountError";
  }
}

const STORAGE_KEY = "axp-session";
// Refresh a little before expiry so a request never goes out with a token that
// dies in flight.
const REFRESH_MARGIN_SECONDS = 60;

const LOADING: SessionState = { status: "loading", user: null };
const GUEST: SessionState = { status: "guest", user: null };

let state: SessionState = LOADING;
let restoreStarted = false;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function readStored(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeStored(session: StoredSession | null) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage blocked (private mode, embedded iframe): the session simply
    // lasts until the tab closes.
  }
}

function adopt(session: StoredSession) {
  writeStored(session);
  setState({ status: "authenticated", user: session.user });
}

function forget() {
  writeStored(null);
  setState(GUEST);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    notify: false
  });
  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error: { code: string; message: string } }
    | null;

  if (!payload) {
    throw new AccountError("REQUEST_ERROR", "Something went wrong. Please try again.");
  }
  if (!payload.ok) {
    throw new AccountError(payload.error.code, payload.error.message);
  }
  return payload.data;
}

async function fetchUser(accessToken: string): Promise<SessionUser | null> {
  const response = await apiFetch("/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    notify: false
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new AccountError("UNAVAILABLE", "Accounts are unavailable just now.");
  const payload = (await response.json()) as { data: { user: SessionUser } };
  return payload.data.user;
}

/** Check the stored session once per page load, refreshing it if it has expired. */
async function restore() {
  const stored = readStored();
  if (!stored) {
    setState(GUEST);
    return;
  }

  // Show the remembered person straight away; the checks below only ever
  // downgrade to guest.
  setState({ status: "authenticated", user: stored.user });

  try {
    if (stored.expiresAt - REFRESH_MARGIN_SECONDS <= Date.now() / 1000) {
      const { session } = await post<{ session: StoredSession }>("/account/refresh", {
        refreshToken: stored.refreshToken
      });
      adopt(session);
      return;
    }

    const user = await fetchUser(stored.accessToken);
    if (user) {
      adopt({ ...stored, user });
    } else {
      forget();
    }
  } catch (error) {
    // A refused refresh means the session is over. Anything else (offline, CRM
    // down) keeps the person signed in rather than logging them out on a blip.
    if (error instanceof AccountError && error.code === "SESSION_EXPIRED") {
      forget();
    }
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!restoreStarted) {
    restoreStarted = true;
    void restore();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return state;
}

/** The prerendered HTML is built with no session, so hydration starts here too. */
export function getServerSnapshot() {
  return LOADING;
}

export async function signIn(email: string, password: string) {
  const { session } = await post<{ session: StoredSession }>("/account/sign-in", { email, password });
  adopt(session);
}

export async function signUp(input: { name: string; email: string; password: string; phone?: string }): Promise<SignUpResult> {
  const result = await post<{ status: "signed_in"; session: StoredSession } | { status: "confirm_email" }>(
    "/account/sign-up",
    input
  );
  if (result.status === "signed_in") {
    adopt(result.session);
  }
  return result.status;
}

export async function resendConfirmation(email: string) {
  await post("/account/resend-confirmation", { email });
}

export async function signOut() {
  const stored = readStored();
  forget();
  if (stored) {
    await apiFetch("/account/sign-out", {
      method: "POST",
      headers: { Authorization: `Bearer ${stored.accessToken}` },
      notify: false
    }).catch(() => undefined);
  }
}

/**
 * The emailed confirmation link lands on /auth with the new session in the URL
 * fragment. Returns true when it did and the person is now signed in; throws an
 * AccountError when the link carried an error (e.g. it expired).
 */
export async function completeSignInFromUrl(): Promise<boolean> {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const clearHash = () =>
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);

  const linkError = params.get("error_description");
  if (linkError) {
    clearHash();
    throw new AccountError(params.get("error_code") ?? "LINK_ERROR", linkError.replace(/\+/g, " "));
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return false;

  clearHash();
  const user = await fetchUser(accessToken).catch(() => null);
  if (!user) {
    throw new AccountError("LINK_ERROR", "That link has expired. Please sign in.");
  }

  const expiresAt = Number(params.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(params.get("expires_in") ?? 3600);
  adopt({ accessToken, refreshToken, expiresAt, user });
  return true;
}
