import { getDb } from "../../../lib/db.js";
import { handleError, json } from "../../../lib/http.js";
import { listBarbers } from "../../../lib/repositories/barberRepository.js";
import { listServices } from "../../../lib/repositories/serviceRepository.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    return json({
      services: await listServices(db),
      barbers: await listBarbers(db, { activeOnly: true }),
    });
  } catch (error) {
    return handleError(error);
  }
}
