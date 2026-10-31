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
  /** ISO timestamp of the edit; the latest one wins. */
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
};

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Storage: attempts live only in this browser's localStorage (key "va-attempts:v1"),
 * accessed through `attemptsApi` in ./client.ts. There is no server and no accounts.
 * Errors are `AttemptApiError`: 404 attempt not on this device, 409 write to a completed
 * attempt, 507 browser storage full or disabled.
 */

/* ---------- Public (client-safe) view: interpretation criteria stripped ---------- */

export type PublicQuestion = Omit<Question, "interpretation">;
export type PublicBlock = Omit<Block, "questions"> & { questions: PublicQuestion[] };
export type PublicAssessment = Omit<Assessment, "blocks"> & { blocks: PublicBlock[] };
