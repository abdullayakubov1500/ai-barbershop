export function upsertTelegramContact(db, { username, telegramUserId }) {
  if (!username || !telegramUserId) {
    return;
  }
  db.prepare(
    `INSERT INTO telegram_contacts (username, telegram_user_id, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(username) DO UPDATE SET
       telegram_user_id = excluded.telegram_user_id,
       updated_at = excluded.updated_at`
  ).run(String(username).toLowerCase(), String(telegramUserId));
}

export function getTelegramContact(db, username) {
  if (!username) {
    return null;
  }
  return db
    .prepare("SELECT * FROM telegram_contacts WHERE username = ?")
    .get(String(username).toLowerCase());
}
