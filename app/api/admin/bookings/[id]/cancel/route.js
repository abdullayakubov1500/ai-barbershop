import { getDb } from "../../../../../../lib/db.js";
import { handleError, json, requireAdmin } from "../../../../../../lib/http.js";
import { cancelExistingBooking } from "../../../../../../lib/services/bookingService.js";

export function POST(_request, { params }) {
  try {
    requireAdmin();
    const booking = cancelExistingBooking(getDb(), Number(params.id));
    return json({ booking });
  } catch (error) {
    return handleError(error);
  }
}
