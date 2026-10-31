import type { Answer, Assessment, Question } from "@/lib/assessment/types";

export type QuestionStatus = "answered" | "unsure" | "skipped" | "empty";

export function questionStatus(q: Question, a?: Answer): QuestionStatus {
  if (!a) return "empty";
  if (a.value?.type === "unsure") return "unsure";
  if (a.value?.type === "skip") return "skipped";
  if (a.value?.type === "option") return "answered";
  if (q.kind === "area" && (a.marks?.length ?? 0) > 0) return "answered";
  return "empty";
}

export type FlatQuestion = { question: Question; blockId: string; blockTitle: string; index: number };

export function flatten(assessment: Assessment): FlatQuestion[] {
  const out: FlatQuestion[] = [];
  for (const block of assessment.blocks) {
    for (const question of block.questions) {
      out.push({ question, blockId: block.id, blockTitle: block.title, index: out.length });
    }
  }
  return out;
}

export function summarize(flat: FlatQuestion[], answers: Record<string, Answer>) {
  const counts = { answered: 0, unsure: 0, skipped: 0, empty: 0 };
  for (const f of flat) counts[questionStatus(f.question, answers[f.question.id])] += 1;
  return { ...counts, total: flat.length, touched: flat.length - counts.empty };
}
