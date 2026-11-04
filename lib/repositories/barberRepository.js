export function listBarbers(db, { activeOnly = false } = {}) {
  const sql = activeOnly
    ? "SELECT * FROM barbers WHERE active = 1 ORDER BY name"
    : "SELECT * FROM barbers ORDER BY active DESC, name";
  return db.prepare(sql).all();
}

export function getBarber(db, id) {
  return db.prepare("SELECT * FROM barbers WHERE id = ?").get(id);
}

export function createBarber(db, { name, specialty }) {
  const result = db
    .prepare("INSERT INTO barbers (name, specialty, active) VALUES (?, ?, 1)")
    .run(name, specialty);
  return getBarber(db, result.lastInsertRowid);
}

export function updateBarber(db, id, { name, specialty, active }) {
  db.prepare(
    "UPDATE barbers SET name = ?, specialty = ?, active = ? WHERE id = ?"
  ).run(name, specialty, active ? 1 : 0, id);
  return getBarber(db, id);
}
