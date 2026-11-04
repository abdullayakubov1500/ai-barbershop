export function listServices(db) {
  return db.prepare("SELECT * FROM services ORDER BY id").all();
}

export function getService(db, id) {
  return db.prepare("SELECT * FROM services WHERE id = ?").get(id);
}
