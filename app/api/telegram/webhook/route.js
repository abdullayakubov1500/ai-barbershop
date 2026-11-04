import { webhookCallback } from "grammy";
import { createBot } from "../../../../bot/createBot.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

let handler;

function getHandler() {
  if (!handler) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN пуст.");
    }
    handler = webhookCallback(createBot(token), "std/http");
  }
  return handler;
}

export async function POST(request) {
  try {
    return await getHandler()(request);
  } catch (error) {
    console.error("[webhook]", error);
    return new Response("ok", { status: 200 });
  }
}
