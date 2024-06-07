import { COOKIE_PREFIX, CSRF_TOKEN_COOKIE_NAME, JWT_COOKIE_NAME } from "$lib/variables.js";
import { getCredentialsServerSide } from "$lib/services/auth.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({
  event,
  event: {
    cookies,
    url: { pathname },
  },
  resolve,
}) {
  const locals = {};

  const jwt = cookies.get(COOKIE_PREFIX + JWT_COOKIE_NAME);
  const csrfToken = cookies.get(COOKIE_PREFIX + CSRF_TOKEN_COOKIE_NAME);

  locals.user =
    jwt && csrfToken &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/auth/") &&
    (await getCredentialsServerSide(jwt));

  locals.csrfToken = csrfToken;

  event.locals = locals;

  return resolve(event);
}
