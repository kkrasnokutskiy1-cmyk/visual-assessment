import type { Metadata } from "next";
import { Suspense } from "react";

import { ResultsScreen, ResultsSkeleton } from "@/components/results/ResultsScreen";

export const metadata: Metadata = {
  title: "Мои результаты",
  robots: { index: false, follow: false },
};

export default function OwnerResultsPage(props: PageProps<"/results/[attemptId]">) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsScreen mode="owner" params={props.params} />
    </Suspense>
  );
}
