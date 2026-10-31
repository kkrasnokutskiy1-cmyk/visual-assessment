// Registry of published sources across assessment versions. Server-side only:
// `problem` / `result` reveal the expected answer, so never import this from client components.
import type { Reference } from "@/lib/assessment/types";
import { references as hierarchy } from "./hierarchy";
import { materialsReferences as materials } from "./materials";
import { typographyReferences as typography } from "./typography";
import { interactionReferences as interaction } from "./interaction";

export const allReferences: readonly Reference[] = [...hierarchy, ...materials, ...typography, ...interaction];

const byId = new Map(allReferences.map((r) => [r.id, r]));
if (byId.size !== allReferences.length) throw new Error("Duplicate Reference id in content/research");

export function getReference(id: string): Reference | undefined {
  return byId.get(id);
}
