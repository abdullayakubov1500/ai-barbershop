import { getAdminSession } from "../../../../lib/auth.js";
import { json } from "../../../../lib/http.js";

export function GET() {
  return json({ ok: Boolean(getAdminSession()) });
}
