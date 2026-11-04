import { getDb } from "../../../../lib/db.js";
import { handleError, json, requireAdmin } from "../../../../lib/http.js";
import { weekOccupancy } from "../../../../lib/services/occupancyService.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    requireAdmin();
    const weekStart = new URL(request.url).searchParams.get("weekStart");
    return json(await weekOccupancy(await getDb(), weekStart));
  } catch (error) {
    return handleError(error);
  }
}
