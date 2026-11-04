import { createSessionCookie, isAdminPassword } from "../../../../lib/auth.js";
import { handleError, json, readBody } from "../../../../lib/http.js";
import { AppError } from "../../../../lib/errors.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    if (!isAdminPassword(body.password)) {
      throw new AppError("Неверный пароль.", 401);
    }
    const cookie = createSessionCookie();
    const response = json({ ok: true });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    return handleError(error);
  }
}
