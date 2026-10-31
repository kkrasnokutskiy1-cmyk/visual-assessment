"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AttemptApiError, attemptsApi, readOutbox } from "@/lib/assessment/client";
import type { Attempt, PublicAssessment } from "@/lib/assessment/types";
import { flatten, summarize } from "./progress";

type Load =
  | { kind: "loading" }
  | { kind: "anon" }
  | { kind: "error"; message: string }
  | { kind: "ready"; attempts: Attempt[] };

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export function AssessmentOverview({ assessments }: { assessments: PublicAssessment[] }) {
  const router = useRouter();
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const fetchAttempts = useCallback(async () => {
    setLoad({ kind: "loading" });
    try {
      setLoad({ kind: "ready", attempts: await attemptsApi.list() });
    } catch (e) {
      if (e instanceof AttemptApiError && e.status === 401) setLoad({ kind: "anon" });
      else setLoad({ kind: "error", message: e instanceof Error ? e.message : "Не удалось загрузить попытки." });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAttempts();
  }, [fetchAttempts]);

  const start = async (assessmentId: string) => {
    setStarting(assessmentId);
    setStartError(null);
    try {
      const attempt = await attemptsApi.create(assessmentId);
      router.push(`/assessment/${encodeURIComponent(attempt.id)}`);
    } catch (e) {
      setStarting(null);
      if (e instanceof AttemptApiError && e.status === 401) setLoad({ kind: "anon" });
      else setStartError(e instanceof Error ? e.message : "Не удалось начать попытку.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-12 px-6 py-12">
      {assessments.length === 0 && (
        <p className="text-body text-muted-foreground">Наборы вопросов пока не опубликованы.</p>
      )}
      {assessments.map((a) => (
        <AssessmentCard
          key={a.id}
          assessment={a}
          load={load}
          starting={starting === a.id}
          startError={startError}
          onStart={() => void start(a.id)}
          onRetry={() => void fetchAttempts()}
        />
      ))}
    </div>
  );
}

function AssessmentCard({
  assessment,
  load,
  starting,
  startError,
  onStart,
  onRetry,
}: {
  assessment: PublicAssessment;
  load: Load;
  starting: boolean;
  startError: string | null;
  onStart: () => void;
  onRetry: () => void;
}) {
  const flat = flatten(assessment);
  const attempts = load.kind === "ready" ? load.attempts.filter((t) => t.assessmentId === assessment.id) : [];
  const active = attempts.find((t) => t.status === "in_progress");
  const done = attempts.filter((t) => t.status === "completed");

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-12">
      <div className="flex flex-col gap-6">
        <header className="flex max-w-[var(--reading-max)] flex-col gap-2">
          <p className="text-caption text-muted-foreground">
            Версия {assessment.version} · {flat.length} вопросов · несколько сеансов по 30–60 минут
          </p>
          <h1 className="text-display font-semibold tracking-tight">{assessment.title}</h1>
          <p className="text-body text-muted-foreground">{assessment.description}</p>
        </header>
        <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {assessment.blocks.map((b, i) => (
            <li key={b.id} className="flex flex-col gap-1 bg-background p-4">
              <p className="text-caption tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")} · {b.questions.length} вопр.
              </p>
              <p className="text-subtitle font-medium">{b.title}</p>
              <p className="text-caption text-muted-foreground">{b.description}</p>
            </li>
          ))}
        </ol>
        <p className="max-w-[var(--reading-max)] text-caption text-muted-foreground">
          Это не тест с правильными ответами: асессмент собирает наблюдения для независимого анализа. Если не уверены —
          так и отметьте, это тоже полезный сигнал. Оценка и разбор не показываются до анализа.
        </p>
      </div>

      <aside className="flex flex-col gap-4">
        {load.kind === "loading" && <div className="h-32 animate-pulse rounded-lg bg-tint" aria-busy="true" />}

        {load.kind === "anon" && (
          <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
            <p className="text-subtitle font-medium">Войдите, чтобы начать</p>
            <p className="text-caption text-muted-foreground">
              Ответы сохраняются в аккаунте и синхронизируются между устройствами.
            </p>
            <div className="flex gap-2">
              <Button asChild size="compact">
                <Link href="/login?next=/assessment">Войти</Link>
              </Button>
              <Button asChild size="compact" variant="tertiary">
                <Link href="/register?next=/assessment">Создать аккаунт</Link>
              </Button>
            </div>
          </div>
        )}

        {load.kind === "error" && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-border p-5">
            <p className="text-subtitle font-medium">Не удалось загрузить попытки</p>
            <p className="text-caption text-muted-foreground">{load.message}</p>
            <Button size="compact" variant="secondary" onClick={onRetry}>
              Повторить
            </Button>
          </div>
        )}

        {load.kind === "ready" && (
          <>
            {active ? (
              <AttemptRow attempt={active} flatTotal={flat.length} assessment={assessment} primary />
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
                <p className="text-subtitle font-medium">{done.length > 0 ? "Новая попытка" : "Начать асессмент"}</p>
                <p className="text-caption text-muted-foreground">
                  {done.length > 0
                    ? "Предыдущие попытки сохранятся без изменений."
                    : "Можно прерваться в любой момент и продолжить с того же места."}
                </p>
                <Button loading={starting} disabled={starting} onClick={onStart}>
                  {done.length > 0 ? "Начать новую попытку" : "Начать"}
                </Button>
                {startError && (
                  <p role="alert" className="text-caption text-destructive">
                    {startError}
                  </p>
                )}
              </div>
            )}
            {done.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-caption text-muted-foreground">Завершённые попытки</p>
                {done.map((t) => (
                  <AttemptRow key={t.id} attempt={t} flatTotal={flat.length} assessment={assessment} />
                ))}
              </div>
            )}
          </>
        )}
      </aside>
    </section>
  );
}

function AttemptRow({
  attempt,
  assessment,
  flatTotal,
  primary,
}: {
  attempt: Attempt;
  assessment: PublicAssessment;
  flatTotal: number;
  primary?: boolean;
}) {
  const answers = { ...attempt.answers, ...(attempt.status === "in_progress" ? readOutbox(attempt.id) : {}) };
  const stats = summarize(flatten(assessment), answers);
  const href =
    attempt.status === "completed"
      ? `/results/${encodeURIComponent(attempt.id)}`
      : `/assessment/${encodeURIComponent(attempt.id)}`;

  if (primary)
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
        <p className="text-subtitle font-medium">Попытка в процессе</p>
        <p className="text-caption tabular-nums text-muted-foreground">
          Отвечено {stats.touched} из {flatTotal} · начата {dateFmt.format(new Date(attempt.startedAt))}
        </p>
        <div className="h-1 overflow-hidden rounded-full bg-tint" aria-hidden>
          <div className="h-full bg-foreground" style={{ width: `${(stats.touched / Math.max(1, flatTotal)) * 100}%` }} />
        </div>
        <Button asChild>
          <Link href={href}>Продолжить</Link>
        </Button>
      </div>
    );

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-body transition-colors duration-[var(--duration-fast)] hover:bg-hover"
    >
      <span>{attempt.completedAt ? dateFmt.format(new Date(attempt.completedAt)) : "—"}</span>
      <span className="text-caption tabular-nums text-muted-foreground">
        {stats.touched}/{flatTotal}
      </span>
    </Link>
  );
}
