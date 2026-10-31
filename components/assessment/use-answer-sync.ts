"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AttemptApiError, attemptsApi, readOutbox, writeOutbox } from "@/lib/assessment/client";
import type { Answer, SaveState } from "@/lib/assessment/types";

const DEBOUNCE_MS = 500;
const RETRY_STEPS_MS = [2000, 5000, 10000, 30000];

export type SyncStatus = {
  state: SaveState;
  pending: number;
  error?: string;
};

/**
 * Autosave with a persistent outbox. Every change is written to localStorage first,
 * then sent to the server; failed sends are retried with backoff and on reconnect.
 */
export function useAnswerSync(attemptId: string, enabled: boolean) {
  const outbox = useRef<Record<string, Answer>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushing = useRef(false);
  const retryStep = useRef(0);
  const flushRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<SyncStatus>({ state: "idle", pending: 0 });

  const schedule = useCallback((delay: number, run: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(run, delay);
  }, []);

  const flush = useCallback(async () => {
    if (!enabled || flushing.current) return;
    const items = Object.values(outbox.current);
    if (items.length === 0) {
      setStatus((s) => (s.state === "saving" ? { state: "saved", pending: 0 } : s));
      return;
    }
    flushing.current = true;
    setStatus({ state: "saving", pending: items.length });
    try {
      // Keep sending until nothing is left: edits made during a send are picked up in the next pass.
      let batch = items;
      while (batch.length > 0) {
        for (const answer of batch) {
          await attemptsApi.saveAnswer(attemptId, answer);
          const current = outbox.current[answer.questionId];
          if (current && current.updatedAt === answer.updatedAt) {
            delete outbox.current[answer.questionId];
            writeOutbox(attemptId, outbox.current);
          }
        }
        batch = Object.values(outbox.current);
      }
      retryStep.current = 0;
      flushing.current = false;
      setStatus({ state: "saved", pending: 0 });
    } catch (e) {
      flushing.current = false;
      const err = e instanceof AttemptApiError ? e : new AttemptApiError("Не удалось сохранить.", 0);
      const pending = Object.keys(outbox.current).length;
      if (err.status === 401) {
        setStatus({ state: "error", pending, error: "Сессия истекла — войдите снова. Ответы сохранены на этом устройстве." });
        return;
      }
      if (err.status === 409) {
        setStatus({ state: "error", pending, error: "Попытка уже завершена, изменения не принимаются." });
        return;
      }
      const delay = RETRY_STEPS_MS[Math.min(retryStep.current, RETRY_STEPS_MS.length - 1)];
      retryStep.current += 1;
      setStatus({
        state: "error",
        pending,
        error:
          err.status === 0
            ? "Нет связи. Ответы сохранены на этом устройстве и будут отправлены автоматически."
            : `${err.message} Повторим автоматически.`,
      });
      schedule(delay, () => flushRef.current());
    }
  }, [attemptId, enabled, schedule]);

  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  /** Restore unsent answers from a previous session (call once after loading the attempt). */
  const restore = useCallback((): Record<string, Answer> => {
    outbox.current = readOutbox(attemptId);
    const n = Object.keys(outbox.current).length;
    if (n > 0) {
      setStatus({ state: "saving", pending: n });
      schedule(0, () => void flush());
    }
    return { ...outbox.current };
  }, [attemptId, flush, schedule]);

  const queue = useCallback(
    (answer: Answer) => {
      outbox.current[answer.questionId] = answer;
      writeOutbox(attemptId, outbox.current);
      setStatus((s) => ({ ...s, state: "saving", pending: Object.keys(outbox.current).length }));
      retryStep.current = 0;
      schedule(DEBOUNCE_MS, () => void flush());
    },
    [attemptId, flush, schedule],
  );

  const retryNow = useCallback(() => {
    retryStep.current = 0;
    schedule(0, () => void flush());
  }, [flush, schedule]);

  /** Wait until the outbox is empty (used before completing). Returns false on failure. */
  const drain = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    for (let i = 0; i < 3 && Object.keys(outbox.current).length > 0; i++) {
      while (flushing.current) await new Promise((r) => setTimeout(r, 100));
      await flush();
      if (timer.current) clearTimeout(timer.current);
    }
    return Object.keys(outbox.current).length === 0;
  }, [flush]);

  useEffect(() => {
    const onOnline = () => retryNow();
    const onUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(outbox.current).length > 0) e.preventDefault();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onUnload);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [retryNow]);

  return { status, queue, restore, retryNow, drain };
}
