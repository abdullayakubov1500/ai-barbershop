import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SERVICES, seedIfEmpty } from "./seed.js";

let db;

function migrate(connection) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      weekday INTEGER NOT NULL,
      start_time TEXT,
      end_time TEXT,
      UNIQUE (barber_id, weekday),
      FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration_min INTEGER NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'booked',
      telegram_user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (barber_id) REFERENCES barbers(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_barber_date
      ON bookings (barber_id, date, status);

    CREATE TABLE IF NOT EXISTS booking_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      sent_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (booking_id, kind),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS telegram_contacts (
      username TEXT PRIMARY KEY,
      telegram_user_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const columns = connection.prepare("PRAGMA table_info(bookings)").all();
  if (!columns.some((column) => column.name === "telegram_username")) {
    connection.exec("ALTER TABLE bookings ADD COLUMN telegram_username TEXT");
  }
}

function syncLocalData(connection) {
  const updatePrice = connection.prepare(
    "UPDATE services SET price = ?, duration_min = ? WHERE name = ?"
  );
  for (const service of SERVICES) {
    updatePrice.run(service.price, service.duration_min, service.name);
  }
  connection
    .prepare(
      `UPDATE bookings
       SET client_phone = '+99890' || substr(replace(client_phone, '+', ''), -7)
       WHERE client_phone LIKE '+7%'`
    )
    .run();
}

export function getDb() {
  if (db) {
    return db;
  }

  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(path.join(dir, "ostrio.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 3000");
  migrate(db);
  seedIfEmpty(db);
  syncLocalData(db);
  return db;
}
