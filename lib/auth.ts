/**
 * Shared admin-auth config, imported by both the Edge middleware and the
 * API route handlers so they never drift. Values come from environment
 * variables (set these in Vercel → Project → Settings → Environment Variables);
 * the fallbacks let local dev work out of the box.
 *
 * NOTE: this only reads `process.env` on the server (middleware + route
 * handlers), so the password is never shipped in the client bundle.
 */
export const SESSION_COOKIE = "admin_session";

export function adminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "1515",
    // The value stored in the session cookie. Anyone without it is redirected
    // to /login. Override with a long random string in production.
    secret: process.env.ADMIN_SESSION_SECRET ?? "lumen-studio-admin-session-v1",
  };
}
