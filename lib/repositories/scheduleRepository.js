import { WEEKDAYS } from "../salon.js";

export function listSchedules(db, barberId) {
  return db
    .prepare("SELECT * FROM schedules WHERE barber_id = ? ORDER BY weekday")
    .all(barberId);
}

export function getScheduleForDay(db, barberId, weekday) {
  return db
    .prepare("SELECT * FROM schedules WHERE barber_id = ? AND weekday = ?")
    .get(barberId, weekday);
}

export function replaceSchedule(db, barberId, days) {
  const upsert = db.prepare(`
    INSERT INTO schedules (barber_id, weekday, start_time, end_time)
    VALUES (@barberId, @weekday, @startTime, @endTime)
    ON CONFLICT(barber_id, weekday) DO UPDATE SET
      start_time = excluded.start_time,
      end_time = excluded.end_time
  `);

  const apply = db.transaction((rows) => {
    for (const day of WEEKDAYS) {
      const row = rows.find((item) => Number(item.weekday) === day.id);
      upsert.run({
        barberId,
        weekday: day.id,
        startTime: row?.startTime || null,
        endTime: row?.endTime || null,
      });
    }
  });

  apply(days);
  return listSchedules(db, barberId);
}

export function listAllSchedules(db) {
  return db.prepare("SELECT * FROM schedules ORDER BY barber_id, weekday").all();
}
