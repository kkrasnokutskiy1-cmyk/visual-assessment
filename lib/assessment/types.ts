// Shared contract for the assessment platform.
// Owner: A. Change only after announcing in team chat.

/** Visual asset reference. `src` is a path under /public (e.g. /assessment-assets/typo-01-a.svg). */
export type Asset = {
  src: string;
  alt: string;
  /** Intrinsic size, used to keep proportions and to map marks. */
  width: number;
  height: number;
};

export type QuestionKind =
  /** Pick one text option. */
  | "choice"
  /** Pick one of several images shown side by side in identical conditions. */
  | "image-choice"
  /** Mark one or more points on a single image. */
  | "area";

export type Option = {
  id: string;
  label?: string;
  asset?: Asset;
};

export type Source = {
  title: string;
  url?: string;
  license: string;
};

/** Interpretation criteria — never shown to the respondent. */
export type Interpretation = {
  observation: string;
  explanations: string[];
  alternatives: string[];
};

export type Question = {
  id: string;
  version: number;
  kind: QuestionKind;
  skills: string[];
  prompt: string;
  /** Context of the example (product, scale, medium). */
  context: string;
  options?: Option[];
  /** Main image (required for "area", optional otherwise). */
  asset?: Asset;
  /** For "area": max number of marks (default 3). */
  maxMarks?: number;
  allowComment: boolean;
  source: Source;
  interpretation: Interpretation;
};

export type Block = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  questions: Question[];
};

export type Assessment = {
  id: string;
  version: number;
  title: string;
  description: string;
  blocks: Block[];
};

export type AnswerValue =
  | { type: "option"; optionId: string }
  | { type: "unsure" }
  | { type: "skip" };

/** Point on the image, normalised to 0..1 of its intrinsic width/height. */
export type Mark = { x: number; y: number };

export type Answer = {
  questionId: string;
  questionVersion: number;
  value?: AnswerValue;
  marks?: Mark[];
  comment?: string;
  /** ISO timestamp set by the client; the server keeps the latest one. */
  updatedAt: string;
};

export type AttemptStatus = "in_progress" | "completed";

export type Attempt = {
  id: string;
  assessmentId: string;
  assessmentVersion: number;
  status: AttemptStatus;
  answers: Record<string, Answer>;
  startedAt: string;
  completedAt?: string;
  /** Present when the owner has an active share link. */
  shareToken?: string | null;
};

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * HTTP API (implemented by C in app/api):
 *   GET    /api/attempts                          -> { attempts: Attempt[] }
 *   POST   /api/attempts  { assessmentId }        -> { attempt: Attempt }
 *   GET    /api/attempts/:id                      -> { attempt: Attempt }
 *   PUT    /api/attempts/:id/answers/:questionId  body Answer -> { answer: Answer }
 *   POST   /api/attempts/:id/complete             -> { attempt: Attempt }
 *   POST   /api/attempts/:id/share                -> { token: string }
 *   DELETE /api/attempts/:id/share                -> { ok: true }
 *   GET    /api/share/:token                      -> { attempt: Attempt }
 * Errors: { error: string } with status 400/401/403/404/409/500.
 * 409 when writing to a completed attempt.
 */
