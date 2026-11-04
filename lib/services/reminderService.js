import { AppError } from "../errors.js";
import { getBooking, listBookings } from "../repositories/bookingRepository.js";
import {
  releaseReminder,
  tryClaimReminder,
} from "../repositories/reminderRepository.js";
import { getTelegramContact } from "../repositories/telegramContactRepository.js";
import {
  addDays,
  canSendReminder,
  formatDateRu,
  minutesUntilStart,
  nowInSalon,
} from "../salon.js";
import { sendTelegramMessage } from "./telegramNotifier.js";

const AUTO_REMINDERS = [
  { kind: "1h", minExclusive: 5, maxInclusive: 60, when: "через час" },
  { kind: "5m", minExclusive: 0, maxInclusive: 5, when: "через 5 минут" },
];

async function clientChatId(db, booking) {
  if (!canSendReminder(booking)) {
    return null;
  }
  if (booking.telegram_user_id) {
    const chatId = String(booking.telegram_user_id);
    return /^\d+$/.test(chatId) ? chatId : null;
  }
  const contact = await getTelegramContact(db, booking.telegram_username);
  if (contact?.telegram_user_id) {
    return String(contact.telegram_user_id);
  }
  return `@${booking.telegram_username}`;
}

function reminderText(booking, when) {
  return [
    `Напоминание о записи в «Остриё».`,
    `${booking.service_name}, мастер ${booking.barber_name}.`,
    `${formatDateRu(booking.date)} в ${booking.start_time}.`,
    `Ждём вас ${when}.`,
  ].join("\n");
}

async function deliver(db, booking, kind, when) {
  const chatId = await clientChatId(db, booking);
  if (!chatId) {
    throw new AppError("Для этой записи Telegram не указан.");
  }
  if (!(await tryClaimReminder(db, booking.id, kind))) {
    return false;
  }
  try {
    await sendTelegramMessage(chatId, reminderText(booking, when));
    return true;
  } catch (error) {
    await releaseReminder(db, booking.id, kind);
    throw error;
  }
}

export async function processDueReminders(db) {
  const { date: today } = nowInSalon();
  const bookings = await listBookings(db, {
    fromDate: today,
    toDate: addDays(today, 1),
    status: "booked",
  });

  for (const booking of bookings) {
    if (!canSendReminder(booking)) {
      continue;
    }
    const minutesLeft = minutesUntilStart(booking.date, booking.start_time);
    for (const reminder of AUTO_REMINDERS) {
      if (minutesLeft > reminder.minExclusive && minutesLeft <= reminder.maxInclusive) {
        try {
          const sent = await deliver(db, booking, reminder.kind, reminder.when);
          if (sent) {
            console.log(`[remind] ${reminder.kind} запись ${booking.id}`);
          }
        } catch (error) {
          console.error(`[remind] ${reminder.kind} запись ${booking.id}`, error.message);
        }
      }
    }
  }
}

export async function sendManualReminder(db, id) {
  const booking = await getBooking(db, id);
  if (!booking) {
    throw new AppError("Запись не найдена.", 404);
  }
  if (booking.status !== "booked") {
    throw new AppError("Напоминание только для активной записи.");
  }
  if (!canSendReminder(booking)) {
    throw new AppError("Клиент не указал Telegram.");
  }
  if (minutesUntilStart(booking.date, booking.start_time) <= 0) {
    throw new AppError("Это время уже прошло.");
  }

  const kind = `manual:${Date.now()}`;
  await deliver(db, booking, kind, "в выбранное время");
  return booking;
}

export function startReminderLoop() {
  const tick = async () => {
    try {
      const { getDb } = await import("../db.js");
      await processDueReminders(await getDb());
    } catch (error) {
      console.error("[remind]", error);
    }
  };
  tick();
  return setInterval(tick, 20_000);
}
