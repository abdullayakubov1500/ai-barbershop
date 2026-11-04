import { getDb } from "../../../lib/db.js";
import { handleError, json } from "../../../lib/http.js";
import { listTodayAvailability } from "../../../lib/services/availabilityService.js";
import { nowInSalon, SALON } from "../../../lib/salon.js";

export function GET() {
  try {
    return json({
      salon: SALON,
      today: nowInSalon(),
      barbers: listTodayAvailability(getDb()),
    });
  } catch (error) {
    return handleError(error);
  }
}
