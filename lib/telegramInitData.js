import crypto from "crypto";
import { AppError } from "./errors.js";

const MAX_AGE_SEC = 60 * 60 * 24;

export function verifyTelegramWebAppUser(initData, botToken) {
  const token = String(botToken || "").trim();
  if (!token) {
    throw new AppError("Бот не настроен для Mini App.", 503);
  }
  const params = new URLSearchParams(String(initData || ""));
  const hash = params.get("hash");
  if (!hash) {
    throw new AppError("Откройте запись из Telegram-бота.", 401);
  }
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const computed = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const left = Buffer.from(computed, "hex");
  const right = Buffer.from(hash, "hex");
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    throw new AppError("Данные Telegram не прошли проверку.", 401);
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SEC) {
    throw new AppError("Сессия Telegram устарела. Откройте приложение снова.", 401);
  }

  let user;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    user = null;
  }
  if (!user?.id) {
    throw new AppError("Не удалось узнать аккаунт Telegram.", 401);
  }
  return user;
}
