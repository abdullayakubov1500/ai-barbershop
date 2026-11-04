import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ostrio_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.SESSION_SECRET || "ostrio-dev-secret-change-me";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function readToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }
  const [body, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function createSessionCookie() {
  const token = sign({ role: "admin", exp: Date.now() + MAX_AGE * 1000 });
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE,
    value: "",
    options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 },
  };
}

export function isAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "ostrio-admin";
  return password === expected;
}

export function getAdminSession() {
  const token = cookies().get(COOKIE)?.value;
  const payload = readToken(token);
  if (!payload || payload.role !== "admin" || payload.exp < Date.now()) {
    return null;
  }
  return payload;
}
