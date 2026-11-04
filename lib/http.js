import { NextResponse } from "next/server";
import { AppError } from "./errors.js";
import { getAdminSession } from "./auth.js";

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleError(error) {
  if (error instanceof AppError) {
    return json({ error: error.message }, error.status);
  }
  console.error(error);
  return json({ error: "Сервер не смог обработать запрос." }, 500);
}

export function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    throw new AppError("Нужен вход в админку.", 401);
  }
  return session;
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new AppError("Некорректное тело запроса.");
  }
}
