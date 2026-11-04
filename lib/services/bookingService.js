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

function assertSlotOpen(db, payload) {
  const slots = listSlots(db, {
    barberId: payload.barberId,
    serviceId: payload.serviceId,
    date: payload.date,
  });
  if (!slots.some((slot) => slot.start === payload.startTime)) {
    throw new AppError("Это время уже занято. Выберите другой слот.", 409);
  }
}

export async function createBooking(db, input) {
  const barber = getBarber(db, Number(input.barberId));
  const service = getService(db, Number(input.serviceId));

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

  const write = db.transaction((data) => {
    assertSlotOpen(db, data);
    return insertBooking(db, data);
  });

  const booking = write(payload);
  try {
    await notifyGroup(booking);
  } catch (error) {
    console.error("[telegram] ошибка уведомления", error);
  }
  return booking;
}

export function cancelExistingBooking(db, id) {
  const booking = getBooking(db, id);
  if (!booking) {
    throw new AppError("Запись не найдена.", 404);
  }
  if (booking.status === "cancelled") {
    throw new AppError("Запись уже отменена.");
  }
  return cancelBooking(db, id);
}

export function listMyTelegramBookings(db, telegramUserId) {
  const { date: today, time: nowTime } = nowInSalon();
  return listUpcomingByTelegram(db, String(telegramUserId), today).filter(
    (booking) => booking.date > today || booking.start_time > nowTime
  );
}
