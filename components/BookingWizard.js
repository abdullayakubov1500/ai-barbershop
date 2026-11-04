"use client";

import { useEffect, useMemo, useState } from "react";
import { groupDaysByMonth, leadingBlanks } from "../lib/calendarGrid.js";
import { WEEKDAYS, formatDateRu, formatMoney } from "../lib/salon.js";

const STEPS = ["Услуга", "Мастер", "День", "Время", "Контакт"];

export default function BookingWizard({ variant = "site" }) {
  const isMini = variant === "mini";
  const [catalog, setCatalog] = useState({ services: [], barbers: [] });
  const [serviceId, setServiceId] = useState(null);
  const [barberId, setBarberId] = useState(null);
  const [days, setDays] = useState([]);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isMini || typeof window === "undefined") {
      return;
    }
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }
    webApp.ready();
    webApp.expand();
    document.documentElement.dataset.theme = webApp.colorScheme === "dark" ? "dark" : "light";
    const user = webApp.initDataUnsafe?.user;
    if (user?.first_name) {
      setClientName([user.first_name, user.last_name].filter(Boolean).join(" "));
    }
  }, [isMini]);

  const step = useMemo(() => {
    if (!serviceId) return 0;
    if (!barberId) return 1;
    if (!date) return 2;
    if (!startTime) return 3;
    return 4;
  }, [serviceId, barberId, date, startTime]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.json())
      .then(setCatalog)
      .catch(() => setError("Не удалось загрузить услуги."));
  }, []);

  useEffect(() => {
    if (!serviceId || !barberId) {
      return;
    }
    setDate("");
    setStartTime("");
    fetch(`/api/availability?serviceId=${serviceId}&barberId=${barberId}`)
      .then((response) => response.json())
      .then((data) => setDays(data.days || []))
      .catch(() => setError("Не удалось получить дни."));
  }, [serviceId, barberId]);

  useEffect(() => {
    if (!serviceId || !barberId || !date) {
      return;
    }
    setStartTime("");
    fetch(`/api/availability?serviceId=${serviceId}&barberId=${barberId}&date=${date}`)
      .then((response) => response.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setError("Не удалось получить время."));
  }, [serviceId, barberId, date]);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          barberId,
          date,
          startTime,
          clientName,
          clientPhone,
          telegramUsername: isMini ? "" : telegramUsername,
          initData: isMini ? window.Telegram?.WebApp?.initData || "" : "",
          localPreview:
            isMini &&
            !window.Telegram?.WebApp?.initData &&
            /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не получилось записать.");
      }
      setDone(data.booking);
      if (isMini) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="sheet">
        <h2>Вы в листе</h2>
        <p className="ok">
          {done.client_name}, {done.service_name} у {done.barber_name} — {done.date} в {done.start_time}.
        </p>
        <p>
          {isMini
            ? "Напомним в этом чате за час и за 5 минут. Отменить запись можно в боте: «Мои записи»."
            : "Если планы изменятся, напишите в барбершоп или отмените запись в боте."}
        </p>
      </div>
    );
  }

  const months = groupDaysByMonth(days);

  return (
    <div className={`wizard${isMini ? " mini-wizard" : ""}`}>
      <ol className="steps">
        {STEPS.map((label, index) => (
          <li key={label} className={index <= step ? "on" : ""}>
            {label}
          </li>
        ))}
      </ol>

      {error && <p className="error">{error}</p>}

      <section className="sheet" style={{ marginBottom: 16 }}>
        <h2>Услуга</h2>
        <div className="choice-grid">
          {catalog.services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`choice ${serviceId === service.id ? "on" : ""}`}
              onClick={() => {
                setServiceId(service.id);
                setBarberId(null);
              }}
            >
              <strong>{service.name}</strong>
              <div>
                {service.duration_min} мин, {formatMoney(service.price)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {serviceId && (
        <section className="sheet" style={{ marginBottom: 16 }}>
          <h2>Мастер</h2>
          <div className="choice-grid">
            {catalog.barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                className={`choice ${barberId === barber.id ? "on" : ""}`}
                onClick={() => setBarberId(barber.id)}
              >
                <strong>{barber.name}</strong>
                <div>{barber.specialty}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {barberId && (
        <section className="sheet" style={{ marginBottom: 16 }}>
          <h2>День</h2>
          {months.map((month) => {
            const pad = month.days[0] ? leadingBlanks(month.days[0].weekday) : 0;
            const cells = [...Array(pad).fill(null), ...month.days];
            return (
              <div className="calendar-month" key={month.key}>
                <h3>{month.title}</h3>
                <div className="calendar">
                  {WEEKDAYS.map((day) => (
                    <div key={day.id} className="head">
                      {day.label}
                    </div>
                  ))}
                  {cells.map((day, index) =>
                    day ? (
                      <button
                        key={day.date}
                        type="button"
                        className={`day ${date === day.date ? "on" : ""}`}
                        disabled={!day.hasSlots}
                        onClick={() => setDate(day.date)}
                      >
                        {Number(day.date.slice(8))}
                      </button>
                    ) : (
                      <div key={`${month.key}-pad-${index}`} />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {date && (
        <section className="sheet" style={{ marginBottom: 16 }}>
          <h2>Время, {formatDateRu(date)}</h2>
          {slots.length === 0 ? (
            <p>На этот день свободных окон нет.</p>
          ) : (
            <div className="slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  className={`slot ${startTime === slot.start ? "on" : ""}`}
                  onClick={() => setStartTime(slot.start)}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {startTime && (
        <form className="sheet" onSubmit={submit}>
          <h2>Как к вам обращаться</h2>
          <div className="form-grid">
            <label>
              <span>Имя</span>
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label>
              <span>Телефон</span>
              <input
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
                autoComplete="tel"
                placeholder="+998"
                required
              />
            </label>
            {!isMini && (
              <>
                <label>
                  <span>Telegram для напоминаний</span>
                  <input
                    value={telegramUsername}
                    onChange={(event) => setTelegramUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="@username"
                  />
                </label>
                <p>
                  Необязательно. Если укажете аккаунт, напомним в Telegram за час и за
                  5 минут. Сначала напишите боту
                  {process.env.NEXT_PUBLIC_BOT_USERNAME
                    ? ` @${process.env.NEXT_PUBLIC_BOT_USERNAME}`
                    : ""}
                  .
                </p>
              </>
            )}
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Пишем в лист…" : "Подтвердить запись"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
