import { Bot, InlineKeyboard, Keyboard, session } from "grammy";
import { getDb } from "../lib/db.js";
import { listBarbers } from "../lib/repositories/barberRepository.js";
import { listServices } from "../lib/repositories/serviceRepository.js";
import { formatDateRu, formatMoney } from "../lib/salon.js";
import { buildCalendarKeyboard } from "../lib/telegramCalendar.js";
import { upsertTelegramContact } from "../lib/repositories/telegramContactRepository.js";
import { listOpenDays, listSlots } from "../lib/services/availabilityService.js";
import {
  cancelExistingBooking,
  createBooking,
  listMyTelegramBookings,
} from "../lib/services/bookingService.js";
import { processDueReminders } from "../lib/services/reminderService.js";

function webAppUrl() {
  return String(process.env.TELEGRAM_WEBAPP_URL || "").trim();
}

function menuKeyboard() {
  const url = webAppUrl();
  if (url) {
    return new Keyboard()
      .webApp("Календарь", url)
      .row()
      .text("Записаться")
      .text("Мои записи")
      .resized();
  }
  return new Keyboard().text("Записаться").text("Мои записи").resized();
}

export function createBot(token = process.env.TELEGRAM_BOT_TOKEN) {
  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    const db = await getDb();
    await upsertTelegramContact(db, {
      username: ctx.from?.username,
      telegramUserId: ctx.from?.id,
    });
    processDueReminders(db).catch(() => {});
    await next();
  });

  bot.use(
    session({
      initial: () => ({
        step: "idle",
        serviceId: null,
        barberId: null,
        date: "",
        calendarMonth: "",
        startTime: "",
        clientName: "",
      }),
    })
  );

  bot.command("start", async (ctx) => {
    ctx.session = {
      step: "idle",
      serviceId: null,
      barberId: null,
      date: "",
      calendarMonth: "",
      startTime: "",
      clientName: "",
    };
    const url = webAppUrl();
    await ctx.reply(
      url
        ? "Это бот барбершопа «Остриё». Календарь записи открывается кнопкой ниже или в меню."
        : "Это бот барбершопа «Остриё». Выберите услугу, мастера и окно в смене.",
      { reply_markup: menuKeyboard() }
    );
  });

  bot.hears("Записаться", async (ctx) => {
    ctx.session.step = "service";
    const db = await getDb();
    const services = await listServices(db);
    const keyboard = new InlineKeyboard();
    for (const service of services) {
      keyboard
        .text(`${service.name}, ${formatMoney(service.price)}`, `svc:${service.id}`)
        .row();
    }
    await ctx.reply("Какая услуга?", { reply_markup: keyboard });
  });

  bot.hears("Мои записи", (ctx) => showMine(ctx));

  bot.callbackQuery(/^svc:(\d+)$/, async (ctx) => {
    ctx.session.serviceId = Number(ctx.match[1]);
    ctx.session.step = "barber";
    const db = await getDb();
    const barbers = await listBarbers(db, { activeOnly: true });
    const keyboard = new InlineKeyboard();
    for (const barber of barbers) {
      keyboard.text(barber.name, `bar:${barber.id}`).row();
    }
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("К кому сесть?", { reply_markup: keyboard });
  });

  bot.callbackQuery(/^bar:(\d+)$/, async (ctx) => {
    ctx.session.barberId = Number(ctx.match[1]);
    ctx.session.step = "day";
    ctx.session.calendarMonth = "";
    await ctx.answerCallbackQuery();
    await showCalendar(ctx);
  });

  bot.callbackQuery(/^cal:(\d{4}-\d{2})$/, async (ctx) => {
    ctx.session.calendarMonth = ctx.match[1];
    await ctx.answerCallbackQuery();
    await showCalendar(ctx);
  });

  bot.callbackQuery("noop", async (ctx) => {
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^day:(.+)$/, async (ctx) => {
    ctx.session.date = ctx.match[1];
    ctx.session.step = "time";
    const db = await getDb();
    const slots = await listSlots(db, {
      barberId: ctx.session.barberId,
      serviceId: ctx.session.serviceId,
      date: ctx.session.date,
    });
    const keyboard = new InlineKeyboard();
    slots.forEach((slot, index) => {
      keyboard.text(slot.start, `tm:${slot.start}`);
      if (index % 3 === 2) {
        keyboard.row();
      }
    });
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("Свободное время:", { reply_markup: keyboard });
  });

  bot.callbackQuery(/^tm:(.+)$/, async (ctx) => {
    ctx.session.startTime = ctx.match[1];
    ctx.session.step = "name";
    await ctx.answerCallbackQuery();
    await ctx.reply("Как к вам обращаться?");
  });

  bot.callbackQuery(/^cancel:(\d+)$/, async (ctx) => {
    try {
      const db = await getDb();
      await cancelExistingBooking(db, Number(ctx.match[1]));
      await ctx.answerCallbackQuery({ text: "Запись снята" });
      await ctx.editMessageText("Запись отменена.");
    } catch (error) {
      await ctx.answerCallbackQuery({ text: error.message, show_alert: true });
    }
  });

  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === "Записаться" || ctx.message.text === "Мои записи") {
      return;
    }

    if (ctx.session.step === "name") {
      ctx.session.clientName = ctx.message.text.trim();
      ctx.session.step = "phone";
      await ctx.reply("Оставьте телефон в формате +998XXXXXXXXX.");
      return;
    }

    if (ctx.session.step === "phone") {
      try {
        const db = await getDb();
        const booking = await createBooking(db, {
          barberId: ctx.session.barberId,
          serviceId: ctx.session.serviceId,
          date: ctx.session.date,
          startTime: ctx.session.startTime,
          clientName: ctx.session.clientName,
          clientPhone: ctx.message.text,
          source: "telegram",
          telegramUserId: ctx.from.id,
        });
        ctx.session.step = "idle";
        await ctx.reply(
          `Записал: ${booking.service_name}, ${booking.barber_name}, ${formatDateRu(booking.date)} в ${booking.start_time}.`
        );
      } catch (error) {
        await ctx.reply(error.message);
      }
    }
  });

  bot.catch((error) => {
    console.error("[bot]", error);
  });

  return bot;
}

export async function configureBotMenu(bot) {
  const url = webAppUrl();
  if (!url) {
    return;
  }
  await bot.api.setChatMenuButton({
    menu_button: {
      type: "web_app",
      text: "Календарь",
      web_app: { url },
    },
  });
}

async function showCalendar(ctx) {
  const db = await getDb();
  const days = await listOpenDays(db, {
    barberId: ctx.session.barberId,
    serviceId: ctx.session.serviceId,
  });
  const firstOpen = days.find((day) => day.hasSlots);
  if (!firstOpen) {
    await ctx.editMessageText("У этого мастера нет свободных окон на 21 день.");
    return;
  }

  const month = ctx.session.calendarMonth || firstOpen.date.slice(0, 7);
  ctx.session.calendarMonth = month;
  await ctx.editMessageText("Выберите день в календаре.", {
    reply_markup: buildCalendarKeyboard(days, month),
  });
}

async function showMine(ctx) {
  const db = await getDb();
  const rows = await listMyTelegramBookings(db, ctx.from.id);
  if (!rows.length) {
    await ctx.reply("Будущих записей нет.");
    return;
  }

  for (const booking of rows) {
    const keyboard = new InlineKeyboard().text("Отменить", `cancel:${booking.id}`);
    await ctx.reply(
      `${booking.service_name}, ${booking.barber_name}, ${formatDateRu(booking.date)} в ${booking.start_time}`,
      { reply_markup: keyboard }
    );
  }
}
