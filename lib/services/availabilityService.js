import { getScheduleForDay } from "../repositories/scheduleRepository.js";
import { listActiveForBarberDate } from "../repositories/bookingRepository.js";
import { getBarber, listBarbers } from "../repositories/barberRepository.js";
import { getService, listServices } from "../repositories/serviceRepository.js";
import {
  addDays,
  addMinutes,
  intervalsOverlap,
  minutesToTime,
  nowInSalon,
  SALON,
  timeToMinutes,
  weekdayFromDate,
} from "../salon.js";

export function listSlots(db, { barberId, serviceId, date }) {
  const barber = getBarber(db, barberId);
  const service = getService(db, serviceId);
  if (!barber || !barber.active) {
    return [];
  }
  if (!service) {
    return [];
  }

  const weekday = weekdayFromDate(date);
  const schedule = getScheduleForDay(db, barberId, weekday);
  if (!schedule?.start_time || !schedule?.end_time) {
    return [];
  }

  const { date: today, time: nowTime } = nowInSalon();
  if (date < today) {
    return [];
  }

  const bookings = listActiveForBarberDate(db, barberId, date);
  const startMin = timeToMinutes(schedule.start_time);
  const endMin = timeToMinutes(schedule.end_time);
  const slots = [];

  for (let cursor = startMin; cursor + service.duration_min <= endMin; cursor += SALON.slotStepMin) {
    const start = minutesToTime(cursor);
    const end = addMinutes(start, service.duration_min);
    if (date === today && timeToMinutes(start) <= timeToMinutes(nowTime)) {
      continue;
    }
    const busy = bookings.some((booking) =>
      intervalsOverlap(start, end, booking.start_time, booking.end_time)
    );
    if (!busy) {
      slots.push({ start, end });
    }
  }

  return slots;
}

export function listOpenDays(db, { barberId, serviceId }) {
  const { date: today } = nowInSalon();
  const days = [];

  for (let offset = 0; offset < SALON.horizonDays; offset += 1) {
    const date = addDays(today, offset);
    const slots = listSlots(db, { barberId, serviceId, date });
    days.push({
      date,
      weekday: weekdayFromDate(date),
      hasSlots: slots.length > 0,
    });
  }

  return days;
}

export function listTodayAvailability(db) {
  const { date: today } = nowInSalon();
  const services = listServices(db);
  const defaultService = services[0];
  const barbers = listBarbers(db, { activeOnly: true });

  return barbers.map((barber) => {
    const slots = defaultService
      ? listSlots(db, {
          barberId: barber.id,
          serviceId: defaultService.id,
          date: today,
        })
      : [];
    return {
      ...barber,
      nextSlot: slots[0]?.start || null,
      freeSlots: slots.length,
    };
  });
}
