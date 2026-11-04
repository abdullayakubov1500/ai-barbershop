import { loadEnv } from "../lib/loadEnv.js";

loadEnv();

const base = process.argv[2];
const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;
if (!base || !secret) {
  console.error("need production url and CRON_SECRET");
  process.exit(1);
}

const url = `${base.replace(/\/$/, "")}/api/telegram/setup?secret=${encodeURIComponent(secret)}`;
const response = await fetch(url);
const body = await response.text();
console.log(response.status, body.replace(secret, "***"));
