const DETAIL_SELECT = `
  SELECT
    bookings.*,
    barbers.name AS barber_name,
    barbers.specialty AS barber_specialty,
    services.name AS service_name,
    services.duration_min,
    services.price
  FROM bookings
  JOIN barbers ON barbers.id = bookings.barber_id
  JOIN services ON services.id = bookings.service_id
`;

export function listBookings(db, { fromDate, toDate, status } = {}) {
  const clauses = [];
  const params = [];

  if (fromDate) {
    clauses.push("bookings.date >= ?");
    params.push(fromDate);
  }
  if (toDate) {
    clauses.push("bookings.date <= ?");
    params.push(toDate);
  }
  if (status) {
    clauses.push("bookings.status = ?");
    params.push(status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(
      `${DETAIL_SELECT} ${where} ORDER BY bookings.date, bookings.start_time`
    )
    .all(...params);
}

export function getBooking(db, id) {
  return db.prepare(`${DETAIL_SELECT} WHERE bookings.id = ?`).get(id);
}

export function listActiveForBarberDate(db, barberId, date) {
  return db
    .prepare(
      `SELECT * FROM bookings
       WHERE barber_id = ? AND date = ? AND status = 'booked'
       ORDER BY start_time`
    )
    .all(barberId, date);
}

export function insertBooking(db, payload) {
  const result = db
    .prepare(
      `INSERT INTO bookings (
        barber_id, service_id, date, start_time, end_time,
        client_name, client_phone, source, status, telegram_user_id, telegram_username
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?, ?)`
    )
    .run(
      payload.barberId,
      payload.serviceId,
      payload.date,
      payload.startTime,
      payload.endTime,
      payload.clientName,
      payload.clientPhone,
      payload.source,
      payload.telegramUserId || null,
      payload.telegramUsername || null
    );
  return getBooking(db, result.lastInsertRowid);
}

export function cancelBooking(db, id) {
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(id);
  return getBooking(db, id);
}

export function listUpcomingByTelegram(db, telegramUserId, fromDate) {
  return db
    .prepare(
      `${DETAIL_SELECT}
       WHERE bookings.telegram_user_id = ?
         AND bookings.status = 'booked'
         AND (bookings.date > ? OR bookings.date = ?)
       ORDER BY bookings.date, bookings.start_time`
    )
    .all(telegramUserId, fromDate, fromDate);
}
