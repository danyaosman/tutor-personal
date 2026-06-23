import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/assignments")({
  component: LearnerAssignmentsPage,
});

function LearnerAssignmentsPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="واجبات المتعلم"
      badgeEn="Learner Assignments"
      titleAr="صفحة الواجبات"
      titleEn="Assignments Page"
      descriptionAr="هنا يمكن لاحقاً عرض الواجبات المطلوبة من المتعلم، مواعيد التسليم، وحالة كل واجب."
      descriptionEn="This page can later show learner assignments, deadlines, and assignment status."
    />
  );
}