import { getDb } from "../../../lib/db.js";
import { handleError, json } from "../../../lib/http.js";
import { listBarbers } from "../../../lib/repositories/barberRepository.js";
import { listServices } from "../../../lib/repositories/serviceRepository.js";

export function GET() {
  try {
    const db = getDb();
    return json({
      services: listServices(db),
      barbers: listBarbers(db, { activeOnly: true }),
    });
  } catch (error) {
    return handleError(error);
  }
}
