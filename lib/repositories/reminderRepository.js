export async function tryClaimReminder(db, bookingId, kind) {
  const rows = await db`
    INSERT INTO booking_reminders (booking_id, kind)
    VALUES (${bookingId}, ${kind})
    ON CONFLICT (booking_id, kind) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}

export async function releaseReminder(db, bookingId, kind) {
  await db`DELETE FROM booking_reminders WHERE booking_id = ${bookingId} AND kind = ${kind}`;
}
