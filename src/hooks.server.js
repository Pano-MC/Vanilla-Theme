import {
  COOKIE_PREFIX,
  JWT_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_NAME,
} from "$lib/variables.js";
import { getCredentialsServerSide } from "$lib/services/auth.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({
  event,
  event: {
    cookies,
    url: { href },
  },
  resolve,
}) {
  const locals = {};

  const jwt = cookies.get(COOKIE_PREFIX + JWT_COOKIE_NAME);
  const CSRFToken = cookies.get(COOKIE_PREFIX + CSRF_TOKEN_COOKIE_NAME);

  locals.user =
    jwt &&
    !href.startsWith("/api/") &&
    !href.startsWith("/auth/") &&
    (await getCredentialsServerSide(jwt));

  locals.jwt = jwt;
  locals.CSRFToken = CSRFToken;

  event.locals = locals;

  return resolve(event);
}
