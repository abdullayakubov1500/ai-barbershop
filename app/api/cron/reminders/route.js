import { getDb } from "../../../../lib/db.js";
import { json } from "../../../../lib/http.js";
import { processDueReminders } from "../../../../lib/services/reminderService.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  const allowed =
    (secret && auth === `Bearer ${secret}`) || (secret && querySecret === secret);
  if (!allowed && process.env.NODE_ENV === "production") {
    return json({ error: "Нет доступа." }, 401);
  }

  await processDueReminders(await getDb());
  return json({ ok: true });
}
