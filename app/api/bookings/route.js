export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getDb } from "../../../lib/db.js";
import { handleError, json, readBody } from "../../../lib/http.js";
import { isLocalDevRequest } from "../../../lib/localRequest.js";
import { createBooking } from "../../../lib/services/bookingService.js";
import { verifyTelegramWebAppUser } from "../../../lib/telegramInitData.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const initData = String(body.initData || "").trim();

    if (body.localPreview && isLocalDevRequest(request)) {
      const booking = await createBooking(getDb(), {
        ...body,
        source: "telegram",
        telegramUserId: "local-preview",
        telegramUsername: "",
      });
      return json({ booking }, 201);
    }

    if (initData) {
      const user = verifyTelegramWebAppUser(initData, process.env.TELEGRAM_BOT_TOKEN);
      const booking = await createBooking(getDb(), {
        ...body,
        source: "telegram",
        telegramUserId: String(user.id),
        telegramUsername: user.username || "",
        clientName:
          body.clientName ||
          [user.first_name, user.last_name].filter(Boolean).join(" "),
      });
      return json({ booking }, 201);
    }

    const booking = await createBooking(getDb(), { ...body, source: "site" });
    return json({ booking }, 201);
  } catch (error) {
    return handleError(error);
  }
}
