import { listBarbers } from "../repositories/barberRepository.js";
import { listAllSchedules } from "../repositories/scheduleRepository.js";
import { listBookings } from "../repositories/bookingRepository.js";
import {
  addDays,
  mondayOfWeek,
  nowInSalon,
  timeToMinutes,
  weekdayFromDate,
} from "../salon.js";

export async function weekOccupancy(db, weekStart) {
  const monday = weekStart || mondayOfWeek(nowInSalon().date);
  const sunday = addDays(monday, 6);
  const barbers = await listBarbers(db);
  const schedules = await listAllSchedules(db);
  const bookings = await listBookings(db, {
    fromDate: monday,
    toDate: sunday,
    status: "booked",
  });

  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));

  const rows = barbers.map((barber) => {
    const byDay = days.map((date) => {
      const weekday = weekdayFromDate(date);
      const schedule = schedules.find(
        (item) => item.barber_id === barber.id && item.weekday === weekday
      );
      const shiftMin =
        schedule?.start_time && schedule?.end_time
          ? timeToMinutes(schedule.end_time) - timeToMinutes(schedule.start_time)
          : 0;
      const bookedMin = bookings
        .filter((item) => item.barber_id === barber.id && item.date === date)
        .reduce(
          (sum, item) =>
            sum + (timeToMinutes(item.end_time) - timeToMinutes(item.start_time)),
          0
        );
      return {
        date,
        weekday,
        shiftMin,
        bookedMin,
        ratio: shiftMin ? Math.min(1, bookedMin / shiftMin) : 0,
      };
    });

    return { barber, days: byDay };
  });

  return { weekStart: monday, days, rows };
}
