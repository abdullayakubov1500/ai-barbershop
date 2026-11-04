import { getDb } from "../../../../../../lib/db.js";
import { handleError, json, requireAdmin } from "../../../../../../lib/http.js";
import { cancelExistingBooking } from "../../../../../../lib/services/bookingService.js";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  try {
    requireAdmin();
    const booking = await cancelExistingBooking(await getDb(), Number(params.id));
    return json({ booking });
  } catch (error) {
    return handleError(error);
  }
}
