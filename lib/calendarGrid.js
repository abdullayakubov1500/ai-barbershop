import { formatMonthYearRu } from "./salon.js";

export function leadingBlanks(weekday) {
  return (weekday + 6) % 7;
}

export function groupDaysByMonth(days) {
  const months = [];
  for (const day of days) {
    const key = day.date.slice(0, 7);
    const last = months[months.length - 1];
    if (!last || last.key !== key) {
      months.push({
        key,
        title: formatMonthYearRu(day.date),
        days: [day],
      });
    } else {
      last.days.push(day);
    }
  }
  return months;
}
