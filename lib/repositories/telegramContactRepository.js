export async function upsertTelegramContact(db, { username, telegramUserId }) {
  if (!username || !telegramUserId) {
    return;
  }
  const handle = String(username).toLowerCase();
  const chatId = String(telegramUserId);
  await db`
    INSERT INTO telegram_contacts (username, telegram_user_id, updated_at)
    VALUES (${handle}, ${chatId}, NOW())
    ON CONFLICT (username) DO UPDATE SET
      telegram_user_id = excluded.telegram_user_id,
      updated_at = excluded.updated_at
  `;
}

export async function getTelegramContact(db, username) {
  if (!username) {
    return null;
  }
  const rows = await db`
    SELECT * FROM telegram_contacts WHERE username = ${String(username).toLowerCase()}
  `;
  return rows[0] || null;
}
