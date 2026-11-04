import { clearSessionCookie } from "../../../../lib/auth.js";
import { json } from "../../../../lib/http.js";

export function POST() {
  const cookie = clearSessionCookie();
  const response = json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
