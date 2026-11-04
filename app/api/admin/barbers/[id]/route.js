import { getDb } from "../../../../../lib/db.js";
import { handleError, json, readBody, requireAdmin } from "../../../../../lib/http.js";
import { saveBarber } from "../../../../../lib/services/barberAdminService.js";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    requireAdmin();
    const body = await readBody(request);
    const barber = await saveBarber(await getDb(), body, Number(params.id));
    return json({ barber });
  } catch (error) {
    return handleError(error);
  }
}
