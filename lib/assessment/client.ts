// Local attempt storage (contract in ./types.ts). Owner: A.
// Everything lives in this browser's localStorage — no server, no accounts.
// Only call from effects or event handlers: localStorage does not exist during SSR.

import type { Answer, Attempt } from "./types";

export class AttemptApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const STORAGE_KEY = "va-attempts:v1";

type Store = Record<string, Attempt>;

function storage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new AttemptApiError("Хранилище браузера недоступно.", 507);
  }
  return window.localStorage;
}

function readStore(): Store {
  const raw = storage().getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  try {
    storage().setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new AttemptApiError(
      "Не удалось записать данные в браузер: хранилище переполнено или отключено.",
      507,
    );
  }
}

function find(store: Store, id: string): Attempt {
  const attempt = store[id];
  if (!attempt) throw new AttemptApiError("Попытка не найдена на этом устройстве.", 404);
  return attempt;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Run synchronously against storage but keep the Promise-based API the screens already use. */
function run<T>(fn: () => T): Promise<T> {
  try {
    return Promise.resolve(fn());
  } catch (e) {
    return Promise.reject(
      e instanceof AttemptApiError ? e : new AttemptApiError("Не удалось прочитать данные браузера.", 500),
    );
  }
}

export const attemptsApi = {
  /** All attempts on this device, newest first. */
  list: () =>
    run(() => Object.values(readStore()).sort((a, b) => b.startedAt.localeCompare(a.startedAt))),

  create: (assessmentId: string, assessmentVersion: number) =>
    run(() => {
      const store = readStore();
      const attempt: Attempt = {
        id: newId(),
        assessmentId,
        assessmentVersion,
        status: "in_progress",
        answers: {},
        startedAt: new Date().toISOString(),
      };
      store[attempt.id] = attempt;
      writeStore(store);
      return attempt;
    }),

  get: (id: string) => run(() => find(readStore(), id)),

  /** Saves an answer; the one with the newer `updatedAt` wins. */
  saveAnswer: (id: string, answer: Answer) =>
    run(() => {
      const store = readStore();
      const attempt = find(store, id);
      if (attempt.status === "completed") {
        throw new AttemptApiError("Завершённую попытку нельзя изменить.", 409);
      }
      const previous = attempt.answers[answer.questionId];
      if (previous && previous.updatedAt > answer.updatedAt) return previous;
      attempt.answers = { ...attempt.answers, [answer.questionId]: answer };
      writeStore(store);
      return answer;
    }),

  complete: (id: string) =>
    run(() => {
      const store = readStore();
      const attempt = find(store, id);
      if (attempt.status !== "completed") {
        attempt.status = "completed";
        attempt.completedAt = new Date().toISOString();
        writeStore(store);
      }
      return attempt;
    }),

  remove: (id: string) =>
    run(() => {
      const store = readStore();
      if (!store[id]) return;
      delete store[id];
      writeStore(store);
    }),
};

/* ---------- Compatibility shims: answers are written directly, so there is no outbox ---------- */

/** @deprecated No outbox any more — always empty. */
export function readOutbox(attemptId: string): Record<string, Answer> {
  void attemptId;
  return {};
}

/** @deprecated No outbox any more — no-op. */
export function writeOutbox(attemptId: string, outbox: Record<string, Answer>) {
  void attemptId;
  void outbox;
}

/** Merge stored answers with pending local ones; the newer `updatedAt` wins. */
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
