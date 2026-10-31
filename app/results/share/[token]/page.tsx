import type { Metadata } from "next";
import { Suspense } from "react";

import { ResultsScreen, ResultsSkeleton } from "@/components/results/ResultsScreen";

export const metadata: Metadata = {
  title: "Результаты асессмента",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function SharedResultsPage(props: PageProps<"/results/share/[token]">) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsScreen mode="share" params={props.params} />
    </Suspense>
  );
}
