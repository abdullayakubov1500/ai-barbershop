import { AppError } from "../errors.js";
import { getBarber } from "../repositories/barberRepository.js";
import {
  cancelBooking,
  getBooking,
  insertBooking,
  listUpcomingByTelegram,
} from "../repositories/bookingRepository.js";
import { getService } from "../repositories/serviceRepository.js";
import {
  addMinutes,
  isValidName,
  normalizePhone,
  nowInSalon,
  parseTelegramUsername,
} from "../salon.js";
import { listSlots } from "./availabilityService.js";
import { notifyGroup } from "./telegramNotifier.js";

async function assertSlotOpen(db, payload) {
  const slots = await listSlots(db, {
    barberId: payload.barberId,
    serviceId: payload.serviceId,
    date: payload.date,
  });
  if (!slots.some((slot) => slot.start === payload.startTime)) {
    throw new AppError("Это время уже занято. Выберите другой слот.", 409);
  }
}

export async function createBooking(db, input) {
  const barber = await getBarber(db, Number(input.barberId));
  const service = await getService(db, Number(input.serviceId));

  if (!barber || !barber.active) {
    throw new AppError("Мастер недоступен.");
  }
  if (!service) {
    throw new AppError("Услуга не найдена.");
  }
  if (!input.date || !input.startTime) {
    throw new AppError("Укажите день и время.");
  }
  if (!isValidName(input.clientName)) {
    throw new AppError("Имя должно быть не короче двух букв.");
  }

  const phone = normalizePhone(input.clientPhone);
  if (!phone) {
    throw new AppError("Введите телефон в формате +998XXXXXXXXX.");
  }

  const source = input.source === "telegram" ? "telegram" : "site";
  const parsed = parseTelegramUsername(input.telegramUsername);
  if (source !== "telegram" && parsed === null) {
    throw new AppError("Ник Telegram укажите как @username или оставьте поле пустым.");
  }
  const telegramUsername = parsed || null;

  const payload = {
    barberId: barber.id,
    serviceId: service.id,
    date: input.date,
    startTime: input.startTime,
    endTime: addMinutes(input.startTime, service.duration_min),
    clientName: String(input.clientName).trim(),
    clientPhone: phone,
    source,
    telegramUserId: input.telegramUserId ? String(input.telegramUserId) : null,
    telegramUsername,
  };

  await assertSlotOpen(db, payload);
  const booking = await insertBooking(db, payload);
  try {
    await notifyGroup(booking);
  } catch (error) {
    console.error("[telegram] ошибка уведомления", error);
  }
  return booking;
}

export async function cancelExistingBooking(db, id) {
  const booking = await getBooking(db, id);
  if (!booking) {
    throw new AppError("Запись не найдена.", 404);
  }
  if (booking.status === "cancelled") {
    throw new AppError("Запись уже отменена.");
  }
  return cancelBooking(db, id);
}

export async function listMyTelegramBookings(db, telegramUserId) {
  const { date: today, time: nowTime } = nowInSalon();
  const rows = await listUpcomingByTelegram(db, String(telegramUserId), today);
  return rows.filter((booking) => booking.date > today || booking.start_time > nowTime);
}
