"use client";

import type { Answer } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";
import { questionStatus, type FlatQuestion, type QuestionStatus } from "./progress";

const dot: Record<QuestionStatus, string> = {
  answered: "bg-foreground",
  unsure: "bg-warning",
  skipped: "border border-muted-foreground",
  empty: "border border-border",
};

export const statusLabel: Record<QuestionStatus, string> = {
  answered: "есть ответ",
  unsure: "не уверен",
  skipped: "пропущен",
  empty: "без ответа",
};

export function QuestionNav({
  flat,
  answers,
  currentId,
  onSelect,
}: {
  flat: FlatQuestion[];
  answers: Record<string, Answer>;
  currentId?: string;
  onSelect: (questionId: string) => void;
}) {
  const blocks: { id: string; title: string; items: FlatQuestion[] }[] = [];
  for (const f of flat) {
    const last = blocks[blocks.length - 1];
    if (last && last.id === f.blockId) last.items.push(f);
    else blocks.push({ id: f.blockId, title: f.blockTitle, items: [f] });
  }
  return (
    <nav aria-label="Вопросы" className="flex flex-col gap-5">
      {blocks.map((b) => (
        <div key={b.id} className="flex flex-col gap-1.5">
          <p className="text-micro uppercase tracking-wide text-muted-foreground">{b.title}</p>
          <ol className="flex flex-wrap gap-1">
            {b.items.map((f) => {
              const st = questionStatus(f.question, answers[f.question.id]);
              const current = f.question.id === currentId;
              return (
                <li key={f.question.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(f.question.id)}
                    aria-current={current ? "step" : undefined}
                    aria-label={`Вопрос ${f.index + 1}, ${statusLabel[st]}`}
                    title={`${f.index + 1}. ${f.question.prompt}`}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-micro tabular-nums transition-colors duration-[var(--duration-fast)]",
                      current ? "bg-tint text-foreground" : "text-muted-foreground hover:bg-hover hover:text-foreground",
                    )}
                  >
                    <span className="relative">
                      {f.index + 1}
                      <span className={cn("absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full", dot[st])} aria-hidden />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}
