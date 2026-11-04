import { canSendReminder } from "../../lib/salon.js";

export default function BookingsPanel({ bookings, onCancel, onRemind }) {
  return (
    <section className="sheet">
      <h2>Ближайшие записи</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Когда</th>
            <th>Мастер</th>
            <th>Клиент</th>
            <th>Откуда</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((item) => (
            <tr key={item.id}>
              <td>
                {item.date}
                <div>
                  {item.start_time}–{item.end_time}
                </div>
              </td>
              <td>
                {item.barber_name}
                <div>{item.service_name}</div>
              </td>
                <td>
                  {item.client_name}
                  <div>{item.client_phone}</div>
                  {item.telegram_username ? <div>@{item.telegram_username}</div> : null}
                </td>
                <td>{item.source === "telegram" ? "Telegram" : "сайт"}</td>
                <td>
                  <div className="actions">
                    {canSendReminder(item) && (
                      <button type="button" className="btn btn-outline" onClick={() => onRemind(item.id)}>
                        Напомнить
                      </button>
                    )}
                    <button type="button" className="btn btn-outline" onClick={() => onCancel(item.id)}>
                      Отменить
                    </button>
                  </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
