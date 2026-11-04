import { canSendReminder } from "../../lib/salon.js";

export default function TodayPanel({ bookings, onRemind }) {
  return (
    <section className="sheet">
      <h2>Лист на сегодня</h2>
      {bookings.length === 0 ? (
        <p>Пока пусто. Можно ждать живую запись или заявку из бота.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Время</th>
              <th>Мастер</th>
              <th>Клиент</th>
              <th>Услуга</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.start_time}–{item.end_time}
                </td>
                <td>{item.barber_name}</td>
                <td>
                  {item.client_name}
                  <div>{item.client_phone}</div>
                  {item.telegram_username ? <div>@{item.telegram_username}</div> : null}
                </td>
                <td>{item.service_name}</td>
                <td>
                  {canSendReminder(item) && (
                    <button type="button" className="btn btn-outline" onClick={() => onRemind(item.id)}>
                      Напомнить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
