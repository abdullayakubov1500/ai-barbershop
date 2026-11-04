export async function listBookings(db, { fromDate, toDate, status } = {}) {
  const from = fromDate || "0000-01-01";
  const to = toDate || "9999-12-31";
  if (status) {
    return db`
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
      WHERE bookings.date >= ${from}
        AND bookings.date <= ${to}
        AND bookings.status = ${status}
      ORDER BY bookings.date, bookings.start_time
    `;
  }
  return db`
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
    WHERE bookings.date >= ${from}
      AND bookings.date <= ${to}
    ORDER BY bookings.date, bookings.start_time
  `;
}

export async function getBooking(db, id) {
  const rows = await db`
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
    WHERE bookings.id = ${id}
  `;
  return rows[0] || null;
}

export async function listActiveForBarberDate(db, barberId, date) {
  return db`
    SELECT * FROM bookings
    WHERE barber_id = ${barberId} AND date = ${date} AND status = 'booked'
    ORDER BY start_time
  `;
}

export async function insertBooking(db, payload) {
  const rows = await db`
    INSERT INTO bookings (
      barber_id, service_id, date, start_time, end_time,
      client_name, client_phone, source, status, telegram_user_id, telegram_username
    ) VALUES (
      ${payload.barberId}, ${payload.serviceId}, ${payload.date}, ${payload.startTime},
      ${payload.endTime}, ${payload.clientName}, ${payload.clientPhone}, ${payload.source},
      'booked', ${payload.telegramUserId || null}, ${payload.telegramUsername || null}
    )
    RETURNING id
  `;
  return getBooking(db, rows[0].id);
}

export async function cancelBooking(db, id) {
  await db`UPDATE bookings SET status = 'cancelled' WHERE id = ${id}`;
  return getBooking(db, id);
}

export async function listUpcomingByTelegram(db, telegramUserId, fromDate) {
  return db`
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
    WHERE bookings.telegram_user_id = ${telegramUserId}
      AND bookings.status = 'booked'
      AND (bookings.date > ${fromDate} OR bookings.date = ${fromDate})
    ORDER BY bookings.date, bookings.start_time
  `;
}
