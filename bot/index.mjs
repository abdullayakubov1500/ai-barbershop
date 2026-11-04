import { loadEnv } from "../lib/loadEnv.js";
import { configureBotMenu, createBot } from "./createBot.mjs";
import { startReminderLoop } from "../lib/services/reminderService.js";

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log("TELEGRAM_BOT_TOKEN пуст: бот ждёт, сайт работает сам.");
  setInterval(() => {}, 60_000);
} else if (process.env.VERCEL) {
  console.log("На Vercel бот работает через webhook.");
} else {
  const bot = createBot(token);
  bot.start({
    onStart: async (info) => {
      console.log(`Бот @${info.username} слушает записи`);
      try {
        await configureBotMenu(bot);
        if (process.env.TELEGRAM_WEBAPP_URL) {
          console.log(`Mini App: ${process.env.TELEGRAM_WEBAPP_URL}`);
        } else {
          console.log("TELEGRAM_WEBAPP_URL пуст: Mini App ждёт HTTPS-адрес /mini");
        }
      } catch (error) {
        console.error("[bot] меню Mini App", error.message);
      }
    },
  });
  startReminderLoop();
}
