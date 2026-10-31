"use client";

import { Check } from "lucide-react";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Answer, AnswerValue, Mark, PublicQuestion } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";
import { MarkLayer } from "./mark-layer";
import { Specimen } from "./specimen";

export type AnswerPatch = Partial<Pick<Answer, "value" | "marks" | "comment">>;

const optionLetter = (i: number) => String.fromCharCode(65 + i);

export function QuestionView({
  question,
  answer,
  readOnly,
  onChange,
}: {
  question: PublicQuestion;
  answer?: Answer;
  readOnly?: boolean;
  onChange: (patch: AnswerPatch) => void;
}) {
  const value = answer?.value;
  const selectedOption = value?.type === "option" ? value.optionId : undefined;
  const marks = answer?.marks ?? [];
  const setValue = (v: AnswerValue) => !readOnly && onChange({ value: v });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex max-w-[var(--reading-max)] flex-col gap-2">
        <h2 className="text-title font-medium text-foreground">{question.prompt}</h2>
        {question.context && <p className="text-body text-muted-foreground">{question.context}</p>}
      </header>

      {question.kind === "area" && question.asset && (
        <div className="flex flex-col gap-2">
          <Specimen
            asset={question.asset}
            className="max-w-[960px]"
            label="Изображение для отметок"
            overlay={
              <MarkLayer
                marks={marks}
                max={question.maxMarks ?? 3}
                disabled={readOnly}
                onChange={(next: Mark[]) => onChange({ marks: next })}
              />
            }
          />
          <p className="text-caption text-muted-foreground">
            {readOnly
              ? `Отметок: ${marks.length}`
              : `Кликните по изображению, чтобы отметить место (до ${question.maxMarks ?? 3}). Клик по отметке убирает её. Отмечено: ${marks.length}.`}
          </p>
        </div>
      )}

      {question.kind !== "area" && question.asset && (
        <Specimen asset={question.asset} className="max-w-[960px]" label="Пример" />
      )}

      {question.kind === "image-choice" && question.options && (
        <div
          role="radiogroup"
          aria-label="Варианты"
          className={cn(
            "grid gap-4",
            question.options.length === 2 ? "grid-cols-2" : question.options.length === 3 ? "grid-cols-3" : "grid-cols-2 xl:grid-cols-4",
          )}
        >
          {question.options.map((opt, i) => {
            const selected = selectedOption === opt.id;
            return (
              <div key={opt.id} className="flex flex-col gap-2">
                {opt.asset ? (
                  <Specimen asset={opt.asset} label={`Вариант ${optionLetter(i)}`} />
                ) : null}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={readOnly}
                  onClick={() => setValue({ type: "option", optionId: opt.id })}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg px-3 text-left text-body transition-colors duration-[var(--duration-fast)]",
                    selected
                      ? "bg-foreground text-background"
                      : "bg-tint text-foreground hover:bg-tint-hover",
                    readOnly && "cursor-default",
                  )}
                >
                  <span className="font-medium tabular-nums">{optionLetter(i)}</span>
                  <span className="truncate">{opt.label ?? `Вариант ${optionLetter(i)}`}</span>
                  {selected && <Check className="ml-auto h-4 w-4" aria-hidden />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {question.kind === "choice" && question.options && (
        <div className="max-w-[var(--reading-max)]">
          <RadioGroup
            value={selectedOption ?? ""}
            onValueChange={(id) => setValue({ type: "option", optionId: id })}
            aria-label="Варианты ответа"
            className={readOnly ? "pointer-events-none" : undefined}
          >
            {question.options.map((opt, i) => (
              <RadioItem key={opt.id} index={i} value={opt.id} label={opt.label ?? opt.id} />
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="tertiary"
          size="compact"
          active={value?.type === "unsure"}
          disabled={readOnly}
          onClick={() => setValue({ type: "unsure" })}
        >
          Не уверен
        </Button>
        <Button
          type="button"
          variant="tertiary"
          size="compact"
          active={value?.type === "skip"}
          disabled={readOnly}
          onClick={() => setValue({ type: "skip" })}
        >
          Пропустить
        </Button>
        {question.kind === "area" && marks.length > 0 && !readOnly && (
          <Button type="button" variant="ghost" size="compact" onClick={() => onChange({ marks: [] })}>
            Убрать все отметки
          </Button>
        )}
      </div>

      {question.allowComment && (
        <label className="flex max-w-[var(--reading-max)] flex-col gap-1.5">
          <span className="text-caption text-muted-foreground">Комментарий (необязательно)</span>
          <textarea
            value={answer?.comment ?? ""}
            readOnly={readOnly}
            maxLength={2000}
            rows={3}
            onChange={(e) => onChange({ comment: e.target.value })}
            placeholder="Что вы заметили и почему"
            className="resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-body outline-none transition-colors duration-[var(--duration-fast)] placeholder:text-muted-foreground focus-visible:border-[color:var(--focus-ring)]"
          />
        </label>
      )}
    </div>
  );
}
