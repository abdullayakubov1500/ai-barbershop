import {
  SALON,
  addDays,
  addMinutes,
  intervalsOverlap,
  nowInSalon,
  timeToMinutes,
  weekdayFromDate,
} from "./salon.js";

export const SERVICES = [
  { name: "Стрижка", duration_min: 45, price: 120000 },
  { name: "Стрижка и борода", duration_min: 75, price: 180000 },
  { name: "Бритьё", duration_min: 40, price: 90000 },
  { name: "Детская стрижка", duration_min: 30, price: 70000 },
];

const BARBERS = [
  {
    name: "Артём Волков",
    specialty: "Классика и аккуратная форма",
    days: [2, 3, 4, 5, 6],
    start: "10:00",
    end: "20:00",
  },
  {
    name: "Илья Сафин",
    specialty: "Фейд и современные стрижки",
    days: [1, 2, 3, 4, 5],
    start: "12:00",
    end: "21:00",
  },
  {
    name: "Марат Хуснуллин",
    specialty: "Борода и опасное бритьё",
    days: [3, 4, 5, 6, 7],
    start: "11:00",
    end: "20:00",
  },
  {
    name: "Кирилл Орлов",
    specialty: "Короткие и детские стрижки",
    days: [1, 2, 3, 4, 5, 6],
    start: "10:00",
    end: "18:00",
  },
];

const CLIENTS = [
  { name: "Павел Егоров", phone: "+998901112201" },
  { name: "Руслан Мирзаев", phone: "+998901112202" },
  { name: "Денис Ковалёв", phone: "+998901112203" },
  { name: "Тимур Гарипов", phone: "+998901112204" },
  { name: "Андрей Соколов", phone: "+998901112205" },
  { name: "Никита Белов", phone: "+998901112206" },
  { name: "Сергей Ильин", phone: "+998901112207" },
  { name: "Максим Юдин", phone: "+998901112208" },
  { name: "Азат Шакиров", phone: "+998901112209" },
  { name: "Игорь Лебедев", phone: "+998901112210" },
  { name: "Вадим Чернов", phone: "+998901112211" },
  { name: "Олег Фролов", phone: "+998901112212" },
  { name: "Ярослав Ким", phone: "+998901112213" },
  { name: "Эдуард Новиков", phone: "+998901112214" },
  { name: "Глеб Морозов", phone: "+998901112215" },
];

function pickSlot(schedule, duration, taken, afterTime) {
  if (!schedule.start_time || !schedule.end_time) {
    return null;
  }

  const startMin = timeToMinutes(schedule.start_time);
  const endMin = timeToMinutes(schedule.end_time);
  const afterMin = afterTime ? timeToMinutes(afterTime) : -1;

  for (let cursor = startMin; cursor + duration <= endMin; cursor += SALON.slotStepMin) {
    if (cursor <= afterMin) {
      continue;
    }
    const start = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
    const end = addMinutes(start, duration);
    const busy = taken.some((item) =>
      intervalsOverlap(start, end, item.start_time, item.end_time)
    );
    if (!busy) {
      return { start, end };
    }
  }
  return null;
}

export async function seedIfEmpty(db) {
  const existing = await db`SELECT COUNT(*)::int AS count FROM barbers`;
  if (existing[0]?.count > 0) {
    return;
  }

  const services = [];
  for (const service of SERVICES) {
    const rows = await db`
      INSERT INTO services (name, duration_min, price)
      VALUES (${service.name}, ${service.duration_min}, ${service.price})
      RETURNING *
    `;
    services.push(rows[0]);
  }

  const barbers = [];
  for (const barber of BARBERS) {
    const rows = await db`
      INSERT INTO barbers (name, specialty, active)
      VALUES (${barber.name}, ${barber.specialty}, 1)
      RETURNING *
    `;
    const id = rows[0].id;
    for (let weekday = 1; weekday <= 7; weekday += 1) {
      const works = barber.days.includes(weekday);
      await db`
        INSERT INTO schedules (barber_id, weekday, start_time, end_time)
        VALUES (
          ${id},
          ${weekday},
          ${works ? barber.start : null},
          ${works ? barber.end : null}
        )
      `;
    }
    barbers.push({ ...barber, id });
  }

  const { date: today, time: nowTime } = nowInSalon();
  const takenByKey = new Map();
  let placed = 0;
  let clientIndex = 0;

  for (let offset = 0; offset < 14 && placed < 15; offset += 1) {
    const date = addDays(today, offset);
    const weekday = weekdayFromDate(date);

    for (const barber of barbers) {
      if (placed >= 15) {
        break;
      }
      if (!barber.days.includes(weekday)) {
        continue;
      }

      const service = services[(placed + offset + Number(barber.id)) % services.length];
      const key = `${barber.id}:${date}`;
      const taken = takenByKey.get(key) || [];
      const afterTime = offset === 0 ? nowTime : null;
      const slot = pickSlot(
        { start_time: barber.start, end_time: barber.end },
        service.duration_min,
        taken,
        afterTime
      );
      if (!slot) {
        continue;
      }

      const client = CLIENTS[clientIndex % CLIENTS.length];
      clientIndex += 1;
      await db`
        INSERT INTO bookings (
          barber_id, service_id, date, start_time, end_time,
          client_name, client_phone, source, status
        ) VALUES (
          ${barber.id}, ${service.id}, ${date}, ${slot.start}, ${slot.end},
          ${client.name}, ${client.phone}, 'site', 'booked'
        )
      `;
      taken.push({ start_time: slot.start, end_time: slot.end });
      takenByKey.set(key, taken);
      placed += 1;
    }
  }
}
