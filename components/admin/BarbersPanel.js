import { WEEKDAYS } from "../../lib/salon.js";

export default function BarbersPanel({
  form,
  barbers,
  onChangeForm,
  onSave,
  onReset,
  onEdit,
}) {
  return (
    <div>
      <section className="sheet" style={{ marginBottom: 18 }}>
        <h2>{form.id ? "Карточка мастера" : "Новый мастер"}</h2>
        <form className="form-grid" onSubmit={onSave}>
          <label>
            <span>Имя</span>
            <input
              value={form.name}
              onChange={(event) => onChangeForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            <span>Специализация</span>
            <input
              value={form.specialty}
              onChange={(event) => onChangeForm({ ...form, specialty: event.target.value })}
              required
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => onChangeForm({ ...form, active: event.target.checked })}
            />{" "}
            Показывать в записи
          </label>
          <div className="schedule-grid">
            {form.schedule.map((day, index) => (
              <div className="schedule-row" key={day.weekday}>
                <strong>{WEEKDAYS[index].label}</strong>
                <input
                  type="time"
                  step="1800"
                  value={day.startTime}
                  onChange={(event) => {
                    const schedule = form.schedule.map((item) =>
                      item.weekday === day.weekday
                        ? { ...item, startTime: event.target.value }
                        : item
                    );
                    onChangeForm({ ...form, schedule });
                  }}
                />
                <input
                  type="time"
                  step="1800"
                  value={day.endTime}
                  onChange={(event) => {
                    const schedule = form.schedule.map((item) =>
                      item.weekday === day.weekday
                        ? { ...item, endTime: event.target.value }
                        : item
                    );
                    onChangeForm({ ...form, schedule });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    const schedule = form.schedule.map((item) =>
                      item.weekday === day.weekday
                        ? { ...item, startTime: "", endTime: "" }
                        : item
                    );
                    onChangeForm({ ...form, schedule });
                  }}
                >
                  Выходной
                </button>
              </div>
            ))}
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Сохранить
            </button>
            {form.id && (
              <button className="btn btn-outline" type="button" onClick={onReset}>
                Новый мастер
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="sheet">
        <h2>Смена</h2>
        {barbers.map((barber) => (
          <article key={barber.id} className="master" style={{ marginBottom: 16 }}>
            <h3>
              {barber.name} {barber.active ? "" : "(скрыт)"}
            </h3>
            <p>{barber.specialty}</p>
            <p>
              {barber.schedule
                .filter((day) => day.startTime)
                .map(
                  (day) =>
                    `${WEEKDAYS[day.weekday - 1].label} ${day.startTime}–${day.endTime}`
                )
                .join(", ") || "график не задан"}
            </p>
            <button type="button" className="btn btn-outline" onClick={() => onEdit(barber)}>
              Править
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
