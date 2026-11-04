import { WEEKDAYS, addDays } from "../../lib/salon.js";

export default function OccupancyPanel({ occupancy, onChangeWeek }) {
  return (
    <section className="sheet">
      <h2>Неделя</h2>
      <div className="week-nav">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onChangeWeek(addDays(occupancy.weekStart, -7))}
        >
          Прошлая
        </button>
        <span>
          {occupancy.weekStart} — {addDays(occupancy.weekStart, 6)}
        </span>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onChangeWeek(addDays(occupancy.weekStart, 7))}
        >
          Следующая
        </button>
      </div>
      <div className="calendar" style={{ marginBottom: 12 }}>
        {WEEKDAYS.map((day) => (
          <div key={day.id} className="head">
            {day.label}
          </div>
        ))}
      </div>
      <div className="bars">
        {occupancy.rows.map((row) => (
          <div className="bar-row" key={row.barber.id}>
            <div>
              <strong>{row.barber.name}</strong>
            </div>
            <div className="bar-days">
              {row.days.map((day) => (
                <div
                  key={day.date}
                  className={`meter ${day.shiftMin ? "" : "off"}`}
                  title={`${day.bookedMin}/${day.shiftMin} мин`}
                >
                  <i style={{ width: `${Math.round(day.ratio * 100)}%` }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
