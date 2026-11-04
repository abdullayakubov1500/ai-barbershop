"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAYS, nowInSalon } from "../lib/salon.js";
import TodayPanel from "./admin/TodayPanel";
import BookingsPanel from "./admin/BookingsPanel";
import BarbersPanel from "./admin/BarbersPanel";
import OccupancyPanel from "./admin/OccupancyPanel";

const TABS = [
  { id: "today", label: "Сегодня" },
  { id: "bookings", label: "Записи" },
  { id: "barbers", label: "Мастера" },
  { id: "occupancy", label: "Загрузка" },
];

const EMPTY_SCHEDULE = WEEKDAYS.map((day) => ({
  weekday: day.id,
  startTime: "",
  endTime: "",
}));

export default function AdminApp() {
  const router = useRouter();
  const [tab, setTab] = useState("today");
  const [ready, setReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    name: "",
    specialty: "",
    active: true,
    schedule: EMPTY_SCHEDULE,
  });

  async function loadAll(weekStart) {
    const [bookingRes, barberRes, occRes] = await Promise.all([
      fetch("/api/admin/bookings?status=booked"),
      fetch("/api/admin/barbers"),
      fetch(`/api/admin/occupancy${weekStart ? `?weekStart=${weekStart}` : ""}`),
    ]);

    if (bookingRes.status === 401) {
      router.replace("/admin/login");
      return;
    }

    const bookingData = await bookingRes.json();
    const barberData = await barberRes.json();
    const occData = await occRes.json();
    setBookings(bookingData.bookings || []);
    setBarbers(barberData.barbers || []);
    setOccupancy(occData);
    setReady(true);
  }

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data) => {
        if (!data.ok) {
          router.replace("/admin/login");
          return;
        }
        return loadAll();
      })
      .catch(() => setError("Админка не открылась."));
  }, [router]);

  async function cancel(id) {
    const response = await fetch(`/api/admin/bookings/${id}/cancel`, { method: "POST" });
    if (response.ok) {
      await loadAll(occupancy?.weekStart);
    }
  }

  async function remind(id) {
    setError("");
    const response = await fetch(`/api/admin/bookings/${id}/remind`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Напоминание не ушло.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function editBarber(barber) {
    setForm({
      id: barber.id,
      name: barber.name,
      specialty: barber.specialty,
      active: Boolean(barber.active),
      schedule: WEEKDAYS.map((day) => {
        const row = barber.schedule.find((item) => item.weekday === day.id);
        return {
          weekday: day.id,
          startTime: row?.startTime || "",
          endTime: row?.endTime || "",
        };
      }),
    });
    setTab("barbers");
  }

  function resetForm() {
    setForm({
      id: null,
      name: "",
      specialty: "",
      active: true,
      schedule: EMPTY_SCHEDULE,
    });
  }

  async function saveBarber(event) {
    event.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      specialty: form.specialty,
      active: form.active,
      schedule: form.schedule.map((day) => ({
        weekday: day.weekday,
        startTime: day.startTime || null,
        endTime: day.endTime || null,
      })),
    };
    const url = form.id ? `/api/admin/barbers/${form.id}` : "/api/admin/barbers";
    const response = await fetch(url, {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Не сохранилось.");
      return;
    }
    resetForm();
    await loadAll(occupancy?.weekStart);
  }

  if (!ready) {
    return <p className="shell">Открываю журнал…</p>;
  }

  const todayStamp = nowInSalon().date;
  const todayBookings = bookings.filter((item) => item.date === todayStamp);
  const journalBookings = [...bookings].sort((a, b) => b.id - a.id);

  return (
    <div className="shell" style={{ paddingBottom: 64 }}>
      <div className="admin-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn ${tab === item.id ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button type="button" className="btn btn-outline" onClick={() => loadAll(occupancy?.weekStart)}>
          Обновить
        </button>
        <button type="button" className="btn btn-outline" onClick={logout}>
          Выйти
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {tab === "today" && <TodayPanel bookings={todayBookings} onRemind={remind} />}
      {tab === "bookings" && (
        <BookingsPanel bookings={journalBookings} onCancel={cancel} onRemind={remind} />
      )}
      {tab === "barbers" && (
        <BarbersPanel
          form={form}
          barbers={barbers}
          onChangeForm={setForm}
          onSave={saveBarber}
          onReset={resetForm}
          onEdit={editBarber}
        />
      )}
      {tab === "occupancy" && occupancy && (
        <OccupancyPanel occupancy={occupancy} onChangeWeek={loadAll} />
      )}
    </div>
  );
}
