// Read-only list of answers for the owner and for the share link.
// Shows what was answered — never interpretation or scoring.
// Owner: D.

import type { AssessmentExport, ExportedQuestion } from "@/lib/export/build";
import { MarkedImage } from "./MarkedImage";

const STATUS_LABEL: Record<ExportedQuestion["response"]["status"], string> = {
  answered: "Ответ",
  unsure: "Не уверен",
  skipped: "Пропущен",
  partial: "Без выбора",
  unanswered: "Нет ответа",
};

export function ResultsSummary({ data }: { data: AssessmentExport }) {
  const s = data.summary;
  const items = [
    ["Вопросов", s.total],
    ["С ответом", s.answered],
    ["Не уверен", s.unsure],
    ["Пропущено", s.skipped],
    ["Без ответа", s.unanswered + s.partial],
    ["С отметками", s.withMarks],
    ["С комментарием", s.withComments],
  ] as const;
  return (
    <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-7">
      {items.map(([label, value]) => (
        <div key={label} className="bg-background px-4 py-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function QuestionResult({ q, index }: { q: ExportedQuestion; index: number }) {
  const chosen = q.response.status === "answered" ? q.response.optionId : undefined;
  const imageOptions = q.options?.filter((o) => o.asset) ?? [];
  return (
    <article className="grid gap-4 border-t py-6 first:border-t-0">
      <header className="flex items-baseline justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground tabular-nums">
            {index}. {q.id} · v{q.version}
            {q.answeredVersion && q.answeredVersion !== q.version
              ? ` (ответ дан на v${q.answeredVersion})`
              : ""}
          </p>
          <h3 className="mt-1 text-base font-medium text-pretty">{q.prompt}</h3>
          {q.context ? <p className="mt-1 text-sm text-muted-foreground">{q.context}</p> : null}
        </div>
        <span
          className={
            "shrink-0 rounded-md border px-2 py-0.5 text-xs " +
            (q.response.status === "answered" ? "text-foreground" : "text-muted-foreground")
          }
        >
          {STATUS_LABEL[q.response.status]}
        </span>
      </header>

      {q.asset ? (
        <div className="max-w-3xl">
          <MarkedImage asset={q.asset} marks={q.marks} />
        </div>
      ) : null}

      {imageOptions.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {imageOptions.map((o) => (
            <li key={o.id} className="grid gap-2">
              <div
                className={
                  "rounded-lg p-0.5 " +
                  (o.id === chosen ? "ring-2 ring-foreground" : "ring-1 ring-transparent")
                }
              >
                <MarkedImage asset={o.asset!} />
              </div>
              <p className="text-sm">
                {o.label ?? o.id}
                {o.id === chosen ? <span className="text-muted-foreground"> — выбран</span> : null}
              </p>
            </li>
          ))}
        </ul>
      ) : q.options && q.options.length > 0 ? (
        <ul className="grid gap-1 text-sm">
          {q.options.map((o) => (
            <li
              key={o.id}
              className={o.id === chosen ? "font-medium" : "text-muted-foreground"}
            >
              {o.id === chosen ? "● " : "○ "}
              {o.label ?? o.id}
            </li>
          ))}
        </ul>
      ) : null}

      {q.comment ? (
        <blockquote className="max-w-prose border-l-2 pl-4 text-sm">{q.comment}</blockquote>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Источник:{" "}
        {q.source.url ? (
          <a href={q.source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {q.source.title}
          </a>
        ) : (
          q.source.title
        )}{" "}
        · {q.source.license}
      </p>
    </article>
  );
}

export function ResultsView({ data }: { data: AssessmentExport }) {
  const offsets = data.blocks.map((_, i) =>
    data.blocks.slice(0, i).reduce((sum, b) => sum + b.questions.length, 0),
  );
  return (
    <div className="grid gap-12">
      {data.blocks.map((block, bi) => (
        <section key={block.id} aria-labelledby={`block-${block.id}`}>
          <h2 id={`block-${block.id}`} className="text-lg font-medium">
            {block.title}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">{block.description}</p>
          <div className="mt-4">
            {block.questions.map((q, qi) => (
              <QuestionResult key={q.id} q={q} index={offsets[bi] + qi + 1} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
