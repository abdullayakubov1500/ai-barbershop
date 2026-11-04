export function tryClaimReminder(db, bookingId, kind) {
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO booking_reminders (booking_id, kind)
       VALUES (?, ?)`
    )
    .run(bookingId, kind);
  return result.changes > 0;
}

export function releaseReminder(db, bookingId, kind) {
  db.prepare(
    "DELETE FROM booking_reminders WHERE booking_id = ? AND kind = ?"
  ).run(bookingId, kind);
}
