import { randomBytes, randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAssessment } from "@/content/assessments";
import type { Answer } from "@/lib/assessment/types";

class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new ApiError(status, message); };
function map(row: Record<string, unknown>, includeToken = true) {
  const snapshot = row.assessment_snapshot as { blocks: { questions: Record<string, unknown>[] }[] };
  const publicSnapshot = { ...snapshot, blocks: snapshot.blocks.map(block => ({ ...block, questions: block.questions.map(question => {
    const result = { ...question }; delete result.interpretation; return result;
  }) })) };
  return { id: row.id, assessmentId: row.assessment_id, assessmentVersion: row.assessment_version,
    assessmentSnapshot: publicSnapshot, status: row.status, answers: row.answers,
    startedAt: (row.started_at as Date).toISOString(), completedAt: row.completed_at ? (row.completed_at as Date).toISOString() : undefined,
    ...(includeToken ? { shareToken: row.share_token } : {}) };
}
async function userId() { const session = await auth(); return session?.user?.id ?? fail(401, "Войдите в аккаунт."); }
function validateAnswer(value: unknown, questionId: string): Answer {
  if (!value || typeof value !== "object") return fail(400, "Некорректный ответ.");
  const a = value as Answer;
  if (a.questionId !== questionId || !Number.isInteger(a.questionVersion) || typeof a.updatedAt !== "string" || !Number.isFinite(Date.parse(a.updatedAt)) || new Date(a.updatedAt).toISOString() !== a.updatedAt || Date.parse(a.updatedAt) > Date.now() + 300000) return fail(400, "Некорректные данные ответа.");
  if (a.comment !== undefined && (typeof a.comment !== "string" || a.comment.length > 5000)) return fail(400, "Комментарий слишком длинный.");
  if (a.marks !== undefined && (!Array.isArray(a.marks) || a.marks.length > 20 || a.marks.some(m => !m || !Number.isFinite(m.x) || !Number.isFinite(m.y) || m.x < 0 || m.x > 1 || m.y < 0 || m.y > 1))) return fail(400, "Некорректные отметки.");
  if (a.value !== undefined && (!a.value || !["option", "unsure", "skip"].includes(a.value.type) || (a.value.type === "option" && (typeof a.value.optionId !== "string" || a.value.optionId.length > 200)))) return fail(400, "Некорректный вариант ответа.");
  return { questionId: a.questionId, questionVersion: a.questionVersion, updatedAt: a.updatedAt, ...(a.value ? { value: a.value } : {}), ...(a.marks ? { marks: a.marks } : {}), ...(a.comment !== undefined ? { comment: a.comment } : {}) };
}
export async function handle(action: string, request: Request, id?: string, questionId?: string) {
  try {
    if (request.method !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) return fail(403, "Недопустимый источник запроса.");
    if (!process.env.DATABASE_URL || (action !== "shared" && !process.env.AUTH_SECRET)) return fail(503, "Сервис хранения пока не настроен.");
    if (action === "shared") {
      const result = await db().query("SELECT * FROM attempts WHERE share_token = $1 AND status = 'completed'", [id]);
      if (!result.rows[0]) return fail(404, "Ссылка недействительна.");
      return Response.json({ attempt: map(result.rows[0], false) });
    }
    const owner = await userId();
    if (action === "list") {
      const result = await db().query("SELECT * FROM attempts WHERE user_id = $1 ORDER BY started_at DESC", [owner]);
      return Response.json({ attempts: result.rows.map(row => map(row)) });
    }
    if (action === "create") {
      const body = await request.json().catch(() => null);
      const assessment = typeof body?.assessmentId === "string" ? getAssessment(body.assessmentId) : undefined;
      if (!assessment) return fail(400, "Асессмент не найден.");
      const result = await db().query("INSERT INTO attempts (id,user_id,assessment_id,assessment_version,assessment_snapshot) VALUES ($1,$2,$3,$4,$5) RETURNING *", [randomUUID(), owner, assessment.id, assessment.version, JSON.stringify(assessment)]);
      return Response.json({ attempt: map(result.rows[0]) }, { status: 201 });
    }
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return fail(404, "Попытка не найдена.");
    if (action === "get") {
      const result = await db().query("SELECT * FROM attempts WHERE id = $1 AND user_id = $2", [id, owner]);
      if (!result.rows[0]) return fail(404, "Попытка не найдена.");
      return Response.json({ attempt: map(result.rows[0]) });
    }
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      const result = await client.query("SELECT * FROM attempts WHERE id = $1 AND user_id = $2 FOR UPDATE", [id, owner]);
      const row = result.rows[0];
      if (!row) return fail(404, "Попытка не найдена.");
      if (action === "answer") {
        if (row.status === "completed") return fail(409, "Завершённую попытку нельзя изменить.");
        const answer = validateAnswer(await request.json().catch(() => null), questionId ?? "");
        const question = row.assessment_snapshot.blocks.flatMap((block: { questions: { id: string; version: number }[] }) => block.questions).find((q: { id: string }) => q.id === questionId);
        if (!question || question.version !== answer.questionVersion) return fail(400, "Вопрос или его версия не найдены.");
        const previous = row.answers[answer.questionId] as Answer | undefined;
        const saved = previous && previous.updatedAt >= answer.updatedAt ? previous : answer;
        if (saved === answer) await client.query("UPDATE attempts SET answers = jsonb_set(answers, ARRAY[$1], $2::jsonb, true) WHERE id = $3", [answer.questionId, JSON.stringify(answer), id]);
        await client.query("COMMIT");
        return Response.json({ answer: saved });
      }
      if (action === "complete") {
        if (row.status !== "completed") { const updated = await client.query("UPDATE attempts SET status='completed', completed_at=now() WHERE id=$1 RETURNING *", [id]); Object.assign(row, updated.rows[0]); }
        await client.query("COMMIT"); return Response.json({ attempt: map(row) });
      }
      if (action === "share") {
        if (row.status !== "completed") return fail(409, "Ссылка доступна после завершения.");
        const token = row.share_token ?? randomBytes(32).toString("base64url");
        await client.query("UPDATE attempts SET share_token=$1 WHERE id=$2", [token, id]);
        await client.query("COMMIT"); return Response.json({ token });
      }
      if (action === "unshare") { await client.query("UPDATE attempts SET share_token=NULL WHERE id=$1", [id]); await client.query("COMMIT"); return Response.json({ ok: true }); }
      return fail(404, "Маршрут не найден.");
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    console.error("API error", error);
    return Response.json({ error: "Сервис временно недоступен. Попробуйте позже." }, { status: 500 });
  }
}
