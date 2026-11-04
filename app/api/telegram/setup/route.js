import { createBot, configureBotMenu } from "../../../../bot/createBot.mjs";
import { json } from "../../../../lib/http.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;
  const given = new URL(request.url).searchParams.get("secret");
  if (!secret || given !== secret) {
    return json({ error: "Нет доступа." }, 401);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return json({ error: "TELEGRAM_BOT_TOKEN пуст." }, 500);
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const webhookUrl = `${proto}://${host}/api/telegram/webhook`;
  const bot = createBot(token);
  await bot.api.setWebhook(webhookUrl);
  await configureBotMenu(bot);
  return json({ ok: true, webhookUrl, miniApp: process.env.TELEGRAM_WEBAPP_URL || "" });
}
