export const ABOUT =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80";

export const CONTACT_PHOTO =
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80";

export const TEAM_PHOTOS = [
  "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
];

export function ServiceIcon({ name }) {
  if (name.includes("борода")) {
    return (
      <svg viewBox="0 0 64 64" width="64" height="64">
        <path d="M16 28c0-8 7-14 16-14s16 6 16 14v6c0 10-7 18-16 18S16 44 16 34v-6Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M22 30c2 8 6 12 10 12s8-4 10-12" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (name.includes("Брить")) {
    return (
      <svg viewBox="0 0 64 64" width="64" height="64">
        <path d="M18 40l22-22 6 6-22 22-8 2 2-8Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M36 22l8 8" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (name.includes("Детск")) {
    return (
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle cx="32" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M16 52c2-10 8-16 16-16s14 6 16 16" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width="64" height="64">
      <path d="M20 12l8 20-8 20M44 12l-8 20 8 20" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}

export const REVIEWS = [
  {
    name: "Павел Егоров",
    role: "постоянный клиент",
    text: "Прихожу к Артёму раз в три недели. Форма держится, запись занимает минуту.",
  },
  {
    name: "Руслан Мирзаев",
    role: "фейд и борода",
    text: "Илья делает плотный фейд без лишних разговоров. В боте удобно переносить окно.",
  },
  {
    name: "Тимур Гарипов",
    role: "бритьё",
    text: "У Марата опасное бритьё как следует: горячее полотенце и чистая линия.",
  },
];

export const STEPS = [
  { n: "01", title: "Выберите услугу", text: "Стрижка, борода, бритьё или детское кресло." },
  { n: "02", title: "Выберите мастера", text: "У каждого свой график и свободные окна." },
  { n: "03", title: "День и время", text: "Календарь показывает только живые слоты." },
  { n: "04", title: "Приходите", text: "Имя и телефон — и место уже в журнале салона." },
];
