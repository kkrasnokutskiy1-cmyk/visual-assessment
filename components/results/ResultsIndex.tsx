"use client";

// Lists every attempt stored in this browser. Owner: D.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { attemptsApi } from "@/lib/assessment/client";
import type { Attempt, PublicAssessment } from "@/lib/assessment/types";
import { flatten, summarize } from "@/components/assessment/progress";
import { ResultsSkeleton } from "./ResultsScreen";

type Load =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; attempts: Attempt[] };

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function ResultsIndex({ bank }: { bank: PublicAssessment[] }) {
  const [load, setLoad] = useState<Load>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    attemptsApi.list().then(
      (attempts) => !cancelled && setLoad({ kind: "ready", attempts }),
      (e: unknown) =>
        !cancelled &&
        setLoad({
          kind: "error",
          message: e instanceof Error ? e.message : "Не удалось прочитать данные браузера.",
        }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.kind === "loading") return <ResultsSkeleton />;

  if (load.kind === "error") {
    return (
      <div className="grid max-w-prose gap-2 py-24" role="alert">
        <h1 className="text-xl font-medium">Результаты недоступны</h1>
        <p className="text-sm text-muted-foreground">{load.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 py-12">
      <header className="grid max-w-prose gap-2">
        <h1 className="text-2xl font-medium">Результаты</h1>
        <p className="text-sm text-muted-foreground">
          Попытки хранятся только в этом браузере. Очистка данных браузера удалит их — для
          резервной копии скачайте JSON на странице результатов.
        </p>
      </header>

      {load.attempts.length === 0 ? (
        <div className="grid max-w-prose justify-items-start gap-3">
          <p className="text-sm text-muted-foreground">На этом устройстве пока нет попыток.</p>
          <Button asChild variant="primary">
            <Link href="/assessment">Перейти к асессменту</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid max-w-[var(--reading-max)] gap-2">
          {load.attempts.map((attempt) => (
            <li key={attempt.id}>
              <AttemptLink attempt={attempt} bank={bank} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AttemptLink({ attempt, bank }: { attempt: Attempt; bank: PublicAssessment[] }) {
  const assessment = bank.find(
    (a) => a.id === attempt.assessmentId && a.version === attempt.assessmentVersion,
  );
  const flat = assessment ? flatten(assessment) : [];
  const touched = assessment ? summarize(flat, attempt.answers).touched : Object.keys(attempt.answers).length;
  const completed = attempt.status === "completed";
  const when = completed && attempt.completedAt ? attempt.completedAt : attempt.startedAt;

  return (
    <Link
      href={`/results/${encodeURIComponent(attempt.id)}`}
      className="flex items-center justify-between gap-6 rounded-lg border border-border px-4 py-3 text-body transition-colors duration-[var(--duration-fast)] hover:bg-hover"
    >
      <span className="grid gap-0.5">
        <span>{assessment?.title ?? attempt.assessmentId}</span>
        <span className="text-caption text-muted-foreground">
          {completed ? "Завершена" : "В процессе"} · {dateFmt.format(new Date(when))}
        </span>
      </span>
      <span className="text-caption tabular-nums text-muted-foreground">
        {touched}/{flat.length || "—"}
      </span>
    </Link>
  );
}
