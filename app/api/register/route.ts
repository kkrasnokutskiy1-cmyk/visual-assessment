import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body?.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) return Response.json({ error: "Укажите email и пароль длиной от 12 символов (не более 72 байт)." }, { status: 400 });
  try {
    const passwordHash = await hash(password, 12);
    await db().query("INSERT INTO users (id,email,password_hash) VALUES ($1,$2,$3)", [randomUUID(), email, passwordHash]);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return Response.json({ error: "Не удалось создать аккаунт. Попробуйте войти." }, { status: 409 });
    console.error("Registration error", error);
    return Response.json({ error: "Сервис временно недоступен. Попробуйте позже." }, { status: 500 });
  }
}
