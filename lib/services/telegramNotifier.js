import { loadEnv } from "../loadEnv.js";
import { formatDateRu } from "../salon.js";

loadEnv();

function formatBooking(booking) {
  const source = booking.source === "telegram" ? "Telegram" : "сайт";
  return [
    "Новая запись в «Остриё»",
    `Клиент: ${booking.client_name}`,
    `Телефон: ${booking.client_phone}`,
    `Услуга: ${booking.service_name}`,
    `Мастер: ${booking.barber_name}`,
    `Когда: ${formatDateRu(booking.date)}, ${booking.start_time}–${booking.end_time}`,
    `Откуда: ${source}`,
    booking.telegram_username ? `Telegram: @${booking.telegram_username}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyGroup(booking) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_GROUP_CHAT_ID || "").trim();
  const text = formatBooking(booking);

  if (!token || !chatId) {
    console.log("[telegram] уведомление пропущено: нет токена или id группы\n" + text);
    return;
  }

  try {
    await sendTelegramMessage(chatId, text);
  } catch (error) {
    console.error("[telegram] не отправилось в группу", error.message);
  }
}

export async function sendTelegramMessage(chatId, text) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN пуст.");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }
}
