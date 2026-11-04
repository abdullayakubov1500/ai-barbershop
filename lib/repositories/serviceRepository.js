export async function listServices(db) {
  return db`SELECT * FROM services ORDER BY id`;
}

export async function getService(db, id) {
  const rows = await db`SELECT * FROM services WHERE id = ${id}`;
  return rows[0] || null;
}
