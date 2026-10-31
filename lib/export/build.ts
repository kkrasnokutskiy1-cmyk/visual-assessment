// Export format for independent analysis of an attempt.
// Owner: D. Pure functions only — safe on server and client.
//
// The export never contains account data (email, password hash, ids of the
// account) and never contains interpretation criteria: the analysis must be
// independent of the hints stored in the question bank.

import type {
  Answer,
  AnswerValue,
  PublicAssessment,
  PublicQuestion,
  Asset,
  Attempt,
  Mark,
  QuestionKind,
  Source,
} from "@/lib/assessment/types";

export const EXPORT_FORMAT = "visual-assessment-export";
export const EXPORT_FORMAT_VERSION = "1.0";

export type ExportedOption = {
  id: string;
  label?: string;
  asset?: Asset;
};

export type ExportedResponse =
  | { status: "answered"; optionId: string; optionLabel?: string }
  | { status: "unsure" }
  | { status: "skipped" }
  /** Answer record exists, but no explicit choice (e.g. marks or comment only). */
  | { status: "partial" }
  | { status: "unanswered" };

export type ExportedQuestion = {
  id: string;
  /** Version of the question in the bank used for rendering. */
  version: number;
  /** Version the respondent actually answered (may differ if the bank changed). */
  answeredVersion?: number;
  kind: QuestionKind;
  skills: string[];
  prompt: string;
  context: string;
  asset?: Asset;
  options?: ExportedOption[];
  maxMarks?: number;
  source: Source;
  response: ExportedResponse;
  /** Marks normalised to 0..1 of the asset intrinsic width/height. */
  marks: Mark[];
  comment?: string;
  answeredAt?: string;
};

export type ExportedBlock = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  questions: ExportedQuestion[];
};

export type ExportSummary = {
  total: number;
  answered: number;
  unsure: number;
  skipped: number;
  partial: number;
  unanswered: number;
  withMarks: number;
  withComments: number;
};

export type AssessmentExport = {
  format: typeof EXPORT_FORMAT;
  formatVersion: typeof EXPORT_FORMAT_VERSION;
  exportedAt: string;
  note: string;
  assessment: {
    id: string;
    version: number;
    title: string;
    description: string;
  };
  attempt: {
    id: string;
    status: Attempt["status"];
    assessmentVersion: number;
    startedAt: string;
    completedAt?: string;
  };
  summary: ExportSummary;
  blocks: ExportedBlock[];
  /** Answers whose question id is not present in the current bank. */
  orphanAnswers: Answer[];
};

const NOTE =
  "Ответы первого прохода визуального асессмента. Оценка и разбор не включены: " +
  "файл предназначен для независимого анализа. Координаты отметок нормированы " +
  "к ширине и высоте изображения (0..1). Ответ «не уверен» и пропуск — значимые наблюдения.";

export function describeResponse(
  value: AnswerValue | undefined,
  question: Pick<PublicQuestion, "options">,
  hasContent: boolean,
): ExportedResponse {
  if (!value) return hasContent ? { status: "partial" } : { status: "unanswered" };
  switch (value.type) {
    case "option": {
      const option = question.options?.find((o) => o.id === value.optionId);
      return {
        status: "answered",
        optionId: value.optionId,
        optionLabel: option?.label ?? option?.asset?.alt,
      };
    }
    case "unsure":
      return { status: "unsure" };
    case "skip":
      return { status: "skipped" };
  }
}

export type BuildExportOptions = {
  now?: Date;
  /** Origin used to turn /assessment-assets/... into absolute URLs, e.g. https://example.vercel.app */
  baseUrl?: string;
};

function absolutize(asset: Asset | undefined, baseUrl?: string): Asset | undefined {
  if (!asset || !baseUrl || /^https?:\/\//.test(asset.src)) return asset;
  return { ...asset, src: new URL(asset.src, baseUrl).toString() };
}

function exportQuestion(
  question: PublicQuestion,
  answer: Answer | undefined,
  baseUrl?: string,
): ExportedQuestion {
  const marks = answer?.marks ?? [];
  const comment = answer?.comment?.trim() || undefined;
  return {
    id: question.id,
    version: question.version,
    answeredVersion: answer?.questionVersion,
    kind: question.kind,
    skills: question.skills,
    prompt: question.prompt,
    context: question.context,
    asset: absolutize(question.asset, baseUrl),
    options: question.options?.map(({ id, label, asset }) => ({
      id,
      label,
      asset: absolutize(asset, baseUrl),
    })),
    maxMarks: question.kind === "area" ? (question.maxMarks ?? 3) : undefined,
    source: question.source,
    response: describeResponse(answer?.value, question, marks.length > 0 || !!comment),
    marks,
    comment,
    answeredAt: answer?.updatedAt,
  };
}

export function summarize(blocks: ExportedBlock[]): ExportSummary {
  const summary: ExportSummary = {
    total: 0,
    answered: 0,
    unsure: 0,
    skipped: 0,
    partial: 0,
    unanswered: 0,
    withMarks: 0,
    withComments: 0,
  };
  for (const block of blocks) {
    for (const q of block.questions) {
      summary.total += 1;
      switch (q.response.status) {
        case "answered":
          summary.answered += 1;
          break;
        case "unsure":
          summary.unsure += 1;
          break;
        case "skipped":
          summary.skipped += 1;
          break;
        case "partial":
          summary.partial += 1;
          break;
        case "unanswered":
          summary.unanswered += 1;
          break;
      }
      if (q.marks.length > 0) summary.withMarks += 1;
      if (q.comment) summary.withComments += 1;
    }
  }
  return summary;
}

export function buildExport(
  attempt: Attempt,
  assessment: PublicAssessment,
  { now = new Date(), baseUrl }: BuildExportOptions = {},
): AssessmentExport {
  const known = new Set<string>();
  const blocks: ExportedBlock[] = assessment.blocks.map((block) => ({
    id: block.id,
    title: block.title,
    description: block.description,
    skills: block.skills,
    questions: block.questions.map((question) => {
      known.add(question.id);
      return exportQuestion(question, attempt.answers[question.id], baseUrl);
    }),
  }));

  return {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    note: NOTE,
    assessment: {
      id: assessment.id,
      version: assessment.version,
      title: assessment.title,
      description: assessment.description,
    },
    attempt: {
      id: attempt.id,
      status: attempt.status,
      assessmentVersion: attempt.assessmentVersion,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    },
    summary: summarize(blocks),
    blocks,
    orphanAnswers: Object.values(attempt.answers).filter((a) => !known.has(a.questionId)),
  };
}

export function exportFileName(data: AssessmentExport): string {
  const date = (data.attempt.completedAt ?? data.exportedAt).slice(0, 10);
  return `${data.assessment.id}-v${data.assessment.version}-${data.attempt.id.slice(0, 8)}-${date}.json`;
}
