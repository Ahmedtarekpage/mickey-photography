import { cookies } from "next/headers";
import { SESSION_COOKIE, adminCredentials } from "@/lib/auth";

/** Server-side admin check for API route handlers (reads the session cookie). */
export function isAdmin(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return !!token && token === adminCredentials().secret;
}
