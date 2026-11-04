import { WEEKDAYS } from "../salon.js";

export async function listSchedules(db, barberId) {
  return db`SELECT * FROM schedules WHERE barber_id = ${barberId} ORDER BY weekday`;
}

export async function getScheduleForDay(db, barberId, weekday) {
  const rows = await db`
    SELECT * FROM schedules WHERE barber_id = ${barberId} AND weekday = ${weekday}
  `;
  return rows[0] || null;
}

export async function replaceSchedule(db, barberId, days) {
  for (const day of WEEKDAYS) {
    const row = days.find((item) => Number(item.weekday) === day.id);
    const startTime = row?.startTime || null;
    const endTime = row?.endTime || null;
    await db`
      INSERT INTO schedules (barber_id, weekday, start_time, end_time)
      VALUES (${barberId}, ${day.id}, ${startTime}, ${endTime})
      ON CONFLICT (barber_id, weekday) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time
    `;
  }
  return listSchedules(db, barberId);
}

export async function listAllSchedules(db) {
  return db`SELECT * FROM schedules ORDER BY barber_id, weekday`;
}
