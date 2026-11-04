import { getDb } from "../../../../lib/db.js";
import { handleError, json, requireAdmin } from "../../../../lib/http.js";
import { listBookings } from "../../../../lib/repositories/bookingRepository.js";
import { addDays, nowInSalon } from "../../../../lib/salon.js";

export function GET(request) {
  try {
    requireAdmin();
    const { searchParams } = new URL(request.url);
    const { date: today } = nowInSalon();
    const fromDate = searchParams.get("from") || today;
    const toDate = searchParams.get("to") || addDays(today, 21);
    const status = searchParams.get("status") || undefined;
    return json({ bookings: listBookings(getDb(), { fromDate, toDate, status }) });
  } catch (error) {
    return handleError(error);
  }
}
