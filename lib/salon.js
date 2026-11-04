export const SALON = {
  name: "Остриё",
  city: "Казань",
  address: "ул. Островского, 12",
  phone: "+998 90 200 15 00",
  timeZone: "Europe/Moscow",
  slotStepMin: 30,
  horizonDays: 21,
};

export function nowInSalon(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type).value;
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

export function weekdayFromDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SALON.timeZone,
    weekday: "short",
  }).format(utc);
  const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return map[weekday];
}

export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function mondayOfWeek(dateStr) {
  const weekday = weekdayFromDate(dateStr);
  return addDays(dateStr, 1 - weekday);
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function civilDayNumber(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function minutesUntilStart(dateStr, timeStr, now = nowInSalon()) {
  return (
    civilDayNumber(dateStr) * 1440 +
    timeToMinutes(timeStr) -
    (civilDayNumber(now.date) * 1440 + timeToMinutes(now.time))
  );
}

export function minutesToTime(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutes(time, minutes) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function intervalsOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

export function formatDateRu(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: SALON.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(utc);
}

export function formatMonthYearRu(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day || 1, 12));
  const text = new Intl.DateTimeFormat("ru-RU", {
    timeZone: SALON.timeZone,
    month: "long",
    year: "numeric",
  }).format(utc);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const WEEKDAYS = [
  { id: 1, label: "Пн" },
  { id: 2, label: "Вт" },
  { id: 3, label: "Ср" },
  { id: 4, label: "Чт" },
  { id: 5, label: "Пт" },
  { id: 6, label: "Сб" },
  { id: 7, label: "Вс" },
];

export function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return "";
}

export function parseTelegramUsername(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return "";
  }
  const handle = value
    .replace(/^https?:\/\/(?:t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
  if (!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(handle)) {
    return null;
  }
  return handle.toLowerCase();
}

export function canSendReminder(booking) {
  const chatId = String(booking?.telegram_user_id || "");
  return Boolean(/^\d+$/.test(chatId) || booking?.telegram_username);
}

export function formatMoney(value) {
  return `${Number(value).toLocaleString("ru-RU")} сум`;
}

export function isValidName(name) {
  return String(name || "").trim().length >= 2;
}
