"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AttemptApiError, attemptsApi, mergeAnswers } from "@/lib/assessment/client";
import type { Answer, Attempt, PublicAssessment } from "@/lib/assessment/types";
import { flatten, summarize } from "./progress";
import { QuestionNav } from "./question-nav";
import { QuestionView, type AnswerPatch } from "./question-view";
import { ReviewPanel } from "./review-panel";
import { SaveIndicator } from "./save-indicator";
import { ErrorState, LoadingState } from "./states";
import { useAnswerSync } from "./use-answer-sync";

type Load =
  | { kind: "loading" }
  | { kind: "error"; message: string; status: number }
  | { kind: "ready"; attempt: Attempt; assessment: PublicAssessment };

const REVIEW = "review";

export function AssessmentRunner({
  attemptId,
  assessments,
}: {
  attemptId: string;
  /** All published versions, interpretation stripped on the server. */
  assessments: PublicAssessment[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const ready = load.kind === "ready";
  const readOnly = ready && load.attempt.status === "completed";
  const sync = useAnswerSync(attemptId, ready && !readOnly);
  const { restore } = sync;

  const fetchAttempt = useCallback(async () => {
    setLoad({ kind: "loading" });
    try {
      const attempt = await attemptsApi.get(attemptId);
      const assessment = assessments.find(
        (a) => a.id === attempt.assessmentId && a.version === attempt.assessmentVersion,
      );
      if (!assessment) {
        setLoad({ kind: "error", status: 404, message: "Набор вопросов для этой попытки не найден." });
        return;
      }
      setLoad({ kind: "ready", attempt, assessment });
    } catch (e) {
      const err = e instanceof AttemptApiError ? e : new AttemptApiError("Не удалось загрузить попытку.", 0);
      setLoad({ kind: "error", status: err.status, message: err.message });
    }
  }, [attemptId, assessments]);

  useEffect(() => {
    // Browser storage is available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAttempt();
  }, [fetchAttempt]);

  // Restore the saved answers once the attempt is loaded.
  const attempt = ready ? load.attempt : null;
  const assessmentForResume = ready ? load.assessment : null;
  useEffect(() => {
    if (!attempt || !assessmentForResume) return;
    const pending = attempt.status === "completed" ? {} : restore();
    const merged = mergeAnswers(attempt.answers, pending);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(merged);
    // Resume: without an explicit ?q, open the first question that has no answer yet.
    if (!new URLSearchParams(window.location.search).get("q")) {
      const all = flatten(assessmentForResume);
      const firstOpen = all.find((f) => !merged[f.question.id]) ?? all[0];
      if (firstOpen) router.replace(`${pathname}?q=${encodeURIComponent(firstOpen.question.id)}`, { scroll: false });
    }
  }, [attempt, assessmentForResume, restore, router, pathname]);

  const flat = useMemo(() => (ready ? flatten(load.assessment) : []), [ready, load]);
  const questionParam = params.get("q");

  const currentIndex = useMemo(() => {
    if (flat.length === 0 || questionParam === REVIEW) return -1;
    const byParam = flat.findIndex((f) => f.question.id === questionParam);
    return byParam >= 0 ? byParam : 0;
  }, [flat, questionParam]);

  const go = useCallback(
    (q: string) => {
      router.replace(`${pathname}?q=${encodeURIComponent(q)}`, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [pathname, router],
  );

  // Arrow keys move between questions when focus is not in a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
      if (e.altKey || e.metaKey || e.ctrlKey || currentIndex < 0) return;
      if (e.key === "ArrowRight" && currentIndex < flat.length - 1) go(flat[currentIndex + 1].question.id);
      if (e.key === "ArrowLeft" && currentIndex > 0) go(flat[currentIndex - 1].question.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, flat, go]);

  if (load.kind === "loading") return <LoadingState label="Загружаем попытку…" />;
  if (load.kind === "error") {
    return (
      <ErrorState
        title={load.status === 404 ? "Попытка не найдена" : "Не удалось загрузить"}
        message={load.message}
        action={
          <Button variant="secondary" onClick={() => void fetchAttempt()}>
            Повторить
          </Button>
        }
      />
    );
  }

  const { assessment } = load;
  const stats = summarize(flat, answers);
  const current = currentIndex >= 0 ? flat[currentIndex] : null;

  const update = (patch: AnswerPatch) => {
    if (!current || readOnly) return;
    const q = current.question;
    const prev = answers[q.id];
    const next: Answer = {
      questionId: q.id,
      questionVersion: q.version,
      value: prev?.value,
      marks: prev?.marks,
      comment: prev?.comment,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    // Marking an area or choosing an option clears an earlier "skip/unsure".
    if (patch.marks && patch.marks.length > 0 && next.value && next.value.type !== "option") next.value = undefined;
    setAnswers((a) => ({ ...a, [q.id]: next }));
    sync.queue(next);
  };

  const complete = async () => {
    setCompleting(true);
    setCompleteError(null);
    const drained = await sync.drain();
    if (!drained) {
      setCompleting(false);
      setCompleteError("Не все ответы удалось сохранить в браузере. Повторите сохранение перед завершением.");
      return;
    }
    try {
      await attemptsApi.complete(attemptId);
      router.push(`/results/${encodeURIComponent(attemptId)}`);
    } catch (e) {
      setCompleting(false);
      setCompleteError(e instanceof Error ? e.message : "Не удалось завершить попытку.");
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[var(--content-max)] grid-cols-[220px_minmax(0,1fr)] gap-10 px-6 py-8">
      <aside className="sticky top-20 flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pb-6">
        <div className="flex flex-col gap-1">
          <p className="text-subtitle font-medium">{assessment.title}</p>
          <p className="text-caption tabular-nums text-muted-foreground">
            Отвечено {stats.touched} из {stats.total}
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-tint" aria-hidden>
            <div
              className="h-full bg-foreground transition-[width] duration-[var(--duration-base)]"
              style={{ width: `${(stats.touched / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
        </div>
        <QuestionNav flat={flat} answers={answers} currentId={current?.question.id} onSelect={go} />
        <Button
          variant={questionParam === REVIEW ? "secondary" : "tertiary"}
          size="compact"
          onClick={() => go(REVIEW)}
        >
          {readOnly ? "Обзор ответов" : "Проверить и завершить"}
        </Button>
      </aside>

      <section className="flex min-w-0 flex-col gap-8">
        <div className="flex h-9 items-center justify-between gap-4 border-b border-border pb-3">
          <p className="text-caption text-muted-foreground">
            {current ? (
              <>
                <span className="tabular-nums">
                  Вопрос {current.index + 1} из {flat.length}
                </span>
                {" · "}
                {current.blockTitle}
              </>
            ) : (
              "Проверка перед завершением"
            )}
          </p>
          <div className="flex items-center gap-3">
            {readOnly ? (
              <span className="text-caption text-muted-foreground">Попытка завершена · только просмотр</span>
            ) : (
              <SaveIndicator status={sync.status} onRetry={sync.retryNow} />
            )}
            {!readOnly && (
              <Button asChild variant="ghost" size="compact">
                <Link href="/assessment">Пауза</Link>
              </Button>
            )}
          </div>
        </div>

        {current ? (
          <>
            <QuestionView
              key={current.question.id}
              question={current.question}
              answer={answers[current.question.id]}
              readOnly={readOnly}
              onChange={update}
            />
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                leadingIcon={ArrowLeft}
                disabled={current.index === 0}
                onClick={() => go(flat[current.index - 1].question.id)}
              >
                Назад
              </Button>
              {current.index < flat.length - 1 ? (
                <Button trailingIcon={ArrowRight} onClick={() => go(flat[current.index + 1].question.id)}>
                  Дальше
                </Button>
              ) : (
                <Button onClick={() => go(REVIEW)}>{readOnly ? "К обзору" : "К проверке"}</Button>
              )}
            </div>
          </>
        ) : (
          <ReviewPanel
            flat={flat}
            answers={answers}
            readOnly={readOnly}
            completing={completing}
            error={completeError}
            onOpen={go}
            onComplete={() => void complete()}
            attemptId={attemptId}
          />
        )}
      </section>
    </div>
  );
}
