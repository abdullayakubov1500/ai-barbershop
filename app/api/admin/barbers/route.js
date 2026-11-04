import { getDb } from "../../../../lib/db.js";
import { handleError, json, readBody, requireAdmin } from "../../../../lib/http.js";
import {
  listBarbersWithSchedule,
  saveBarber,
} from "../../../../lib/services/barberAdminService.js";

export function GET() {
  try {
    requireAdmin();
    return json({ barbers: listBarbersWithSchedule(getDb()) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    requireAdmin();
    const body = await readBody(request);
    const barber = saveBarber(getDb(), body);
    return json({ barber }, 201);
  } catch (error) {
    return handleError(error);
  }
}
