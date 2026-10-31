// Shared contract for the assessment platform.
// Owner: A. Change only after announcing in team chat.

/** Visual asset reference. `src` is a path under /public (e.g. /assessment-assets/typo-01-a.svg). */
export type Asset = {
  src: string;
  alt: string;
  /** Intrinsic size, used to keep proportions and to map marks. */
  width: number;
  height: number;
  /** Who made the image (author / company), shown under it. Required for third-party images. */
  credit?: string;
  /** Page the image was taken from (the original post or article). */
  originUrl?: string;
  /**
   * Usage basis as honestly known, e.g. "CC BY 4.0", "OGL v3",
   * "Цитирование в учебных целях, права не подтверждены".
   */
  license?: string;
  /** Short caption under the image, e.g. "До" / "После" — only when it does not give away the answer. */
  caption?: string;
};

/**
 * v1 used all three kinds. v2 uses only "image-choice" and "choice"; every v2 question
 * shows at least one real image from its Reference ("area" is kept only so v1 attempts open).
 */
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
  author?: string;
  publisher?: string;
  /** ISO date or year of publication. */
  publishedAt?: string;
};

/**
 * A real, published case (article, X thread, talk) that a v2 question is built on.
 * Nothing in it is invented: `problem`/`change`/`result` paraphrase the author,
 * `quote` is verbatim (≤ 2 sentences). Lives in content/research/<topic>.ts.
 */
export type Reference = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  topic: string;
  /** What the author says is wrong with "before" (paraphrase). */
  problem: string;
  /** What they changed. */
  change?: string;
  /** Verbatim quote from the source, at most two sentences. */
  quote?: string;
  /** Measured effect exactly as the source reports it; omit if the source gives none. */
  result?: string;
  /** Real images from the source (local copies with credit/originUrl/license). */
  figures: { before?: Asset; after?: Asset; single?: Asset };
};

/** Client-safe part of a Reference: citation only, no author argument (it would give the answer away). */
export type PublicReference = Pick<Reference, "id" | "title" | "author" | "publisher" | "url" | "publishedAt">;

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
  /** Main image (required for "area"; in v2 required for "choice" unless `figures` is set). */
  asset?: Asset;
  /** v2: several images shown above text options (e.g. a before/after pair). */
  figures?: Asset[];
  /** v2: id of the Reference (content/research/<topic>.ts) the question is built on. Required in v2. */
  refId?: string;
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

export type PublicQuestion = Omit<Question, "interpretation"> & {
  /** Citation of the Reference, attached server-side from `refId`. */
  reference?: PublicReference;
};
export type PublicBlock = Omit<Block, "questions"> & { questions: PublicQuestion[] };
export type PublicAssessment = Omit<Assessment, "blocks"> & { blocks: PublicBlock[] };
