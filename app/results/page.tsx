import type { Metadata } from "next";

import { ResultsIndex } from "@/components/results/ResultsIndex";
import { publicAllVersions } from "@/lib/assessment/public";

export const metadata: Metadata = {
  title: "Результаты",
  robots: { index: false, follow: false },
};

export default function ResultsIndexPage() {
  return <ResultsIndex bank={publicAllVersions()} />;
}
