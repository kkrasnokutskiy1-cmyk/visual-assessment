import type { Attempt, PublicAssessment, PublicReference } from "@/lib/assessment/types";

export type ReadingModule = {
  id: string;
  title: string;
  description: string;
  needsReview: number;
  sources: PublicReference[];
};

/** Reading list, not a diagnosis: uncertainty and skips only change the order. */
export function buildReadingPath(assessment: PublicAssessment, attempt: Attempt): ReadingModule[] {
  return assessment.blocks
    .map((block, index) => {
      const seen = new Set<string>();
      const sources = block.questions.flatMap(({ reference }) => {
        if (!reference?.url || seen.has(reference.url)) return [];
        seen.add(reference.url);
        return [reference];
      });
      const needsReview = block.questions.filter(({ id }) => {
        const value = attempt.answers[id]?.value;
        return value?.type === "unsure" || value?.type === "skip";
      }).length;
      return { id: block.id, title: block.title, description: block.description, needsReview, sources, index };
    })
    .filter((block) => block.sources.length > 0)
    .sort((a, b) => b.needsReview - a.needsReview || a.index - b.index)
    .map(({ index: _index, ...block }) => { void _index; return block; });
}
