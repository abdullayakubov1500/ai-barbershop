import { getDb } from "../../../lib/db.js";
import { handleError, json } from "../../../lib/http.js";
import {
  listOpenDays,
  listSlots,
} from "../../../lib/services/availabilityService.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = Number(searchParams.get("barberId"));
    const serviceId = Number(searchParams.get("serviceId"));
    const date = searchParams.get("date");

    if (!barberId || !serviceId) {
      return json({ error: "Нужны мастер и услуга." }, 400);
    }

    const db = await getDb();
    if (date) {
      return json({
        date,
        slots: await listSlots(db, { barberId, serviceId, date }),
      });
    }

    return json({ days: await listOpenDays(db, { barberId, serviceId }) });
  } catch (error) {
    return handleError(error);
  }
}
