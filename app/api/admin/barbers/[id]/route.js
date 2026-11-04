import { getDb } from "../../../../../lib/db.js";
import { handleError, json, readBody, requireAdmin } from "../../../../../lib/http.js";
import { saveBarber } from "../../../../../lib/services/barberAdminService.js";

export async function PUT(request, { params }) {
  try {
    requireAdmin();
    const body = await readBody(request);
    const barber = saveBarber(getDb(), body, Number(params.id));
    return json({ barber });
  } catch (error) {
    return handleError(error);
  }
}
