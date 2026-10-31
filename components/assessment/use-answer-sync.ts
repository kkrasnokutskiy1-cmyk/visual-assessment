"use client";

import { useCallback, useRef, useState } from "react";
import { AttemptApiError, attemptsApi } from "@/lib/assessment/client";
import type { Answer, SaveState } from "@/lib/assessment/types";

export type SyncStatus = {
  state: SaveState;
  pending: number;
  error?: string;
};

/**
 * Autosave to this browser's storage. Each change is written immediately; if a write
 * fails (storage full or disabled) the answer stays in memory until `retryNow`.
 */
export function useAnswerSync(attemptId: string, enabled: boolean) {
  const pending = useRef<Record<string, Answer>>({});
  const flushing = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<SyncStatus>({ state: "idle", pending: 0 });

  const flush = useCallback((): Promise<void> => {
    if (!enabled) return Promise.resolve();
    if (flushing.current) return flushing.current;
    const run = (async () => {
      // Edits queued while writing are picked up by the next pass.
      while (Object.keys(pending.current).length > 0) {
        for (const answer of Object.values(pending.current)) {
          await attemptsApi.saveAnswer(attemptId, answer);
          if (pending.current[answer.questionId]?.updatedAt === answer.updatedAt) {
            delete pending.current[answer.questionId];
          }
        }
      }
      setStatus({ state: "saved", pending: 0 });
    })()
      .catch((e: unknown) => {
        const err = e instanceof AttemptApiError ? e : new AttemptApiError("Не удалось сохранить.", 0);
        setStatus({
          state: "error",
          pending: Object.keys(pending.current).length,
          error:
            err.status === 409
              ? "Попытка уже завершена, изменения не принимаются."
              : `${err.message} Освободите место или разрешите хранение данных для сайта.`,
        });
      })
      .finally(() => {
        flushing.current = null;
      });
    flushing.current = run;
    return run;
  }, [attemptId, enabled]);

  /** Kept for API compatibility: nothing is pending between page loads. */
  const restore = useCallback((): Record<string, Answer> => ({}), []);

  const queue = useCallback(
    (answer: Answer) => {
      pending.current[answer.questionId] = answer;
      setStatus((s) => ({ ...s, state: "saving", pending: Object.keys(pending.current).length }));
      void flush();
    },
    [flush],
  );

  const retryNow = useCallback(() => {
    void flush();
  }, [flush]);

  /** Write everything still pending (used before completing). Returns false on failure. */
  const drain = useCallback(async (): Promise<boolean> => {
    if (flushing.current) await flushing.current;
    if (Object.keys(pending.current).length > 0) await flush();
    return Object.keys(pending.current).length === 0;
  }, [flush]);

  return { status, queue, restore, retryNow, drain };
}
