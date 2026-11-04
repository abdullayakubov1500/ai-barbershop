export async function listBarbers(db, { activeOnly = false } = {}) {
  if (activeOnly) {
    return db`SELECT * FROM barbers WHERE active = 1 ORDER BY name`;
  }
  return db`SELECT * FROM barbers ORDER BY active DESC, name`;
}

export async function getBarber(db, id) {
  const rows = await db`SELECT * FROM barbers WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createBarber(db, { name, specialty }) {
  const rows = await db`
    INSERT INTO barbers (name, specialty, active)
    VALUES (${name}, ${specialty}, 1)
    RETURNING *
  `;
  return rows[0];
}

export async function updateBarber(db, id, { name, specialty, active }) {
  const rows = await db`
    UPDATE barbers
    SET name = ${name}, specialty = ${specialty}, active = ${active ? 1 : 0}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}
