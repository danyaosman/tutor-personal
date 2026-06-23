import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/progress")({
  component: LearnerProgressPage,
});

function LearnerProgressPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="تقدم المتعلم"
      badgeEn="Learner Progress"
      titleAr="صفحة التقدم"
      titleEn="Progress Page"
      descriptionAr="هنا يمكن لاحقاً عرض تقدم المتعلم، نشاطه داخل الكورسات، ونتائج الاختبارات عبر الوقت."
      descriptionEn="This page can later show learner progress, course activity, and quiz performance over time."
    />
  );
}