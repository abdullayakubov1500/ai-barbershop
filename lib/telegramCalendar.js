import { InlineKeyboard } from "grammy";
import { leadingBlanks } from "./calendarGrid.js";
import {
  WEEKDAYS,
  formatMonthYearRu,
  weekdayFromDate,
} from "./salon.js";

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return next.toISOString().slice(0, 7);
}

function daysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthRange(days) {
  if (!days.length) {
    return { min: "", max: "" };
  }
  return {
    min: days[0].date.slice(0, 7),
    max: days[days.length - 1].date.slice(0, 7),
  };
}

export function buildCalendarKeyboard(days, monthKey) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const { min, max } = monthRange(days);
  const first = `${monthKey}-01`;
  const weekday = weekdayFromDate(first);
  const total = daysInMonth(monthKey);
  const keyboard = new InlineKeyboard();

  for (const day of WEEKDAYS) {
    keyboard.text(day.label, "noop");
  }
  keyboard.row();

  let column = 0;
  const blanks = leadingBlanks(weekday);
  for (let i = 0; i < blanks; i += 1) {
    keyboard.text(" ", "noop");
    column += 1;
  }

  for (let day = 1; day <= total; day += 1) {
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    const info = byDate.get(date);
    if (info?.hasSlots) {
      keyboard.text(String(day), `day:${date}`);
    } else {
      keyboard.text("·", "noop");
    }
    column += 1;
    if (column === 7) {
      keyboard.row();
      column = 0;
    }
  }

  if (column > 0) {
    while (column < 7) {
      keyboard.text(" ", "noop");
      column += 1;
    }
    keyboard.row();
  }

  const prev = shiftMonth(monthKey, -1);
  const next = shiftMonth(monthKey, 1);
  keyboard
    .text(monthKey > min ? "‹" : " ", monthKey > min ? `cal:${prev}` : "noop")
    .text(formatMonthYearRu(first), "noop")
    .text(monthKey < max ? "›" : " ", monthKey < max ? `cal:${next}` : "noop");

  return keyboard;
}
