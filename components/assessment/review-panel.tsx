"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Answer } from "@/lib/assessment/types";
import { questionStatus, summarize, type FlatQuestion } from "./progress";
import { statusLabel } from "./question-nav";

export function ReviewPanel({
  flat,
  answers,
  readOnly,
  completing,
  error,
  onOpen,
  onComplete,
  attemptId,
}: {
  flat: FlatQuestion[];
  answers: Record<string, Answer>;
  readOnly: boolean;
  completing: boolean;
  error: string | null;
  onOpen: (questionId: string) => void;
  onComplete: () => void;
  attemptId: string;
}) {
  const stats = summarize(flat, answers);
  const open = flat.filter((f) => questionStatus(f.question, answers[f.question.id]) !== "answered");

  return (
    <div className="flex max-w-[var(--reading-max)] flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-title font-medium">{readOnly ? "Обзор попытки" : "Проверка перед завершением"}</h2>
        <p className="text-body text-muted-foreground">
          {readOnly
            ? "Попытка зафиксирована. Ответы можно просмотреть, но не изменить."
            : "После завершения ответы фиксируются как снимок. Новую попытку можно начать отдельно — эта сохранится."}
        </p>
      </header>

      <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {(
          [
            ["Есть ответ", stats.answered],
            ["Не уверен", stats.unsure],
            ["Пропущено", stats.skipped],
            ["Без ответа", stats.empty],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="bg-background px-4 py-3">
            <dt className="text-caption text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-title font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {open.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-caption text-muted-foreground">Без уверенного ответа — можно вернуться:</p>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {open.map((f) => (
              <li key={f.question.id}>
                <button
                  type="button"
                  onClick={() => onOpen(f.question.id)}
                  className="flex w-full items-baseline gap-3 px-4 py-2.5 text-left text-body transition-colors duration-[var(--duration-fast)] hover:bg-hover"
                >
                  <span className="w-6 shrink-0 tabular-nums text-muted-foreground">{f.index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{f.question.prompt}</span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {statusLabel[questionStatus(f.question, answers[f.question.id])]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        {readOnly ? (
          <Button asChild>
            <Link href={`/results/${encodeURIComponent(attemptId)}`}>Результаты и экспорт</Link>
          </Button>
        ) : (
          <Button loading={completing} disabled={completing} onClick={onComplete}>
            Завершить попытку
          </Button>
        )}
      </div>
    </div>
  );
}
