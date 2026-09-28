import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, signOut, subscribe } from "@/lib/session";

/**
 * The website account session: `status` is "loading" until the stored session
 * has been checked, then "authenticated" or "guest". Never treat "loading" as
 * "guest" -- that bounces a signed-in person to /auth on first paint.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    status: session.status,
    user: session.user,
    isPending: session.status === "loading",
    isAuthenticated: session.status === "authenticated",
    signOut
  };
}
