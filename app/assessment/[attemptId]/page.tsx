import { Suspense } from "react";
import { AssessmentRunner } from "@/components/assessment/assessment-runner";
import { LoadingState } from "@/components/assessment/states";

export const metadata = { title: "Прохождение" };

export default async function AttemptPage({ params }: PageProps<"/assessment/[attemptId]">) {
  const { attemptId } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <AssessmentRunner attemptId={attemptId} />
    </Suspense>
  );
}
