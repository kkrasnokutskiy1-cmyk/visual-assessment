import { AssessmentOverview } from "@/components/assessment/assessment-overview";
import { publicLatestAssessments } from "@/lib/assessment/public";

export const metadata = { title: "Асессмент" };

export default function AssessmentPage() {
  return <AssessmentOverview assessments={publicLatestAssessments()} />;
}
