import { getDb } from "../lib/db.js";

const db = await getDb();
const barbers = await db`SELECT COUNT(*)::int AS c FROM barbers`;
const services = await db`SELECT COUNT(*)::int AS c FROM services`;
console.log(`seeded barbers=${barbers[0].c} services=${services[0].c}`);
