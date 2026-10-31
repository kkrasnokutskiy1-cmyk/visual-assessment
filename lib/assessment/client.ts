// Client-side calls to the attempts API (contract in ./types.ts). Owner: A.

import type { Answer, Attempt } from "./types";

export class AttemptApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new AttemptApiError("Нет соединения с сервером.", 0);
  }
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) {
    throw new AttemptApiError(body?.error ?? `Сервер ответил ошибкой ${res.status}.`, res.status);
  }
  return body as T;
}

const enc = encodeURIComponent;

export const attemptsApi = {
  list: () => request<{ attempts: Attempt[] }>("/api/attempts").then((r) => r.attempts),
  create: (assessmentId: string) =>
    request<{ attempt: Attempt }>("/api/attempts", {
      method: "POST",
      body: JSON.stringify({ assessmentId }),
    }).then((r) => r.attempt),
  get: (id: string) => request<{ attempt: Attempt }>(`/api/attempts/${enc(id)}`).then((r) => r.attempt),
  saveAnswer: (id: string, answer: Answer) =>
    request<{ answer: Answer }>(`/api/attempts/${enc(id)}/answers/${enc(answer.questionId)}`, {
      method: "PUT",
      body: JSON.stringify(answer),
    }).then((r) => r.answer),
  complete: (id: string) =>
    request<{ attempt: Attempt }>(`/api/attempts/${enc(id)}/complete`, { method: "POST" }).then(
      (r) => r.attempt,
    ),
};

/* ---------- Outbox: unsent answers survive reloads and network loss ---------- */

const outboxKey = (attemptId: string) => `va-outbox:${attemptId}`;

export function readOutbox(attemptId: string): Record<string, Answer> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(outboxKey(attemptId));
    return raw ? (JSON.parse(raw) as Record<string, Answer>) : {};
  } catch {
    return {};
  }
}

export function writeOutbox(attemptId: string, outbox: Record<string, Answer>) {
  try {
    if (Object.keys(outbox).length === 0) window.localStorage.removeItem(outboxKey(attemptId));
    else window.localStorage.setItem(outboxKey(attemptId), JSON.stringify(outbox));
  } catch {
    // Storage full or disabled: answers stay in memory and are retried from there.
  }
}

/** Merge server answers with pending local ones; the newer `updatedAt` wins. */
export function mergeAnswers(
  server: Record<string, Answer>,
  pending: Record<string, Answer>,
): Record<string, Answer> {
  const merged = { ...server };
  for (const [id, local] of Object.entries(pending)) {
    const remote = merged[id];
    if (!remote || remote.updatedAt < local.updatedAt) merged[id] = local;
  }
  return merged;
}
