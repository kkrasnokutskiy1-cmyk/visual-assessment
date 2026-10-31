// Server-side helpers that hand the bank to client components without
// interpretation criteria. Import only from server components / route handlers.

import { getAssessment, listAssessments } from "@/content/assessments";
import type { Assessment, PublicAssessment } from "./types";

export function toPublicAssessment(a: Assessment): PublicAssessment {
  return {
    ...a,
    blocks: a.blocks.map((b) => ({
      ...b,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      questions: b.questions.map(({ interpretation, ...q }) => q),
    })),
  };
}

/** Latest version of every assessment (for the overview). */
export function publicLatestAssessments(): PublicAssessment[] {
  return listAssessments().map(toPublicAssessment);
}

/** Every published version of every assessment, so old attempts open with their own questions. */
export function publicAllVersions(): PublicAssessment[] {
  const out: PublicAssessment[] = [];
  for (const latest of listAssessments()) {
    for (let v = 1; v <= latest.version; v++) {
      const a = getAssessment(latest.id, v);
      if (a) out.push(toPublicAssessment(a));
    }
  }
  return out;
}
