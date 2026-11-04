import { AppError } from "../errors.js";
import {
  createBarber,
  getBarber,
  listBarbers,
  updateBarber,
} from "../repositories/barberRepository.js";
import {
  listSchedules,
  replaceSchedule,
} from "../repositories/scheduleRepository.js";
import { timeToMinutes } from "../salon.js";

function mapSchedule(rows) {
  return rows.map((row) => ({
    weekday: row.weekday,
    startTime: row.start_time,
    endTime: row.end_time,
  }));
}

function validateSchedule(days) {
  if (!Array.isArray(days)) {
    throw new AppError("Укажите график на неделю.");
  }

  return days.map((day) => {
    const weekday = Number(day.weekday);
    if (weekday < 1 || weekday > 7) {
      throw new AppError("День недели должен быть от 1 до 7.");
    }
    if (!day.startTime || !day.endTime) {
      return { weekday, startTime: null, endTime: null };
    }
    if (timeToMinutes(day.endTime) <= timeToMinutes(day.startTime)) {
      throw new AppError("Конец смены должен быть позже начала.");
    }
    return {
      weekday,
      startTime: day.startTime,
      endTime: day.endTime,
    };
  });
}

export async function listBarbersWithSchedule(db) {
  const barbers = await listBarbers(db);
  const result = [];
  for (const barber of barbers) {
    result.push({
      ...barber,
      schedule: mapSchedule(await listSchedules(db, barber.id)),
    });
  }
  return result;
}

export async function saveBarber(db, input, id = null) {
  const name = String(input.name || "").trim();
  const specialty = String(input.specialty || "").trim();
  if (name.length < 2) {
    throw new AppError("Имя мастера слишком короткое.");
  }
  if (specialty.length < 2) {
    throw new AppError("Укажите специализацию.");
  }

  const days = validateSchedule(input.schedule || []);
  const barber = id
    ? await updateBarber(db, id, {
        name,
        specialty,
        active: input.active !== false,
      })
    : await createBarber(db, { name, specialty });
  if (!barber) {
    throw new AppError("Мастер не найден.", 404);
  }
  await replaceSchedule(db, barber.id, days);
  return {
    ...(await getBarber(db, barber.id)),
    schedule: mapSchedule(await listSchedules(db, barber.id)),
  };
}
