// Registry of published cases the v2 assessment is built on. Server-side only:
// `problem` / `result` reveal the expected answer, so never import this from client components.
import type { Reference } from "@/lib/assessment/types";
import { references as hierarchy } from "./hierarchy";
import { materialsReferences as materials } from "./materials";

export const allReferences: readonly Reference[] = [...hierarchy, ...materials];

const byId = new Map(allReferences.map((r) => [r.id, r]));
if (byId.size !== allReferences.length) throw new Error("Duplicate Reference id in content/research");

export function getReference(id: string): Reference | undefined {
  return byId.get(id);
}
