import { getDb } from "../../../../../../lib/db.js";
import { handleError, json, requireAdmin } from "../../../../../../lib/http.js";
import { sendManualReminder } from "../../../../../../lib/services/reminderService.js";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  try {
    requireAdmin();
    const booking = await sendManualReminder(getDb(), Number(params.id));
    return json({ ok: true, booking });
  } catch (error) {
    return handleError(error);
  }
}
