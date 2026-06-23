import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/resources")({
  component: LearnerResourcesPage,
});

function LearnerResourcesPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="مصادر التعلم"
      badgeEn="Learning Resources"
      titleAr="صفحة المصادر"
      titleEn="Resources Page"
      descriptionAr="هنا يمكن لاحقاً عرض ملفات PDF، المراجع، والمواد التي يرفعها المدرّس داخل الكورس."
      descriptionEn="This page can later show PDFs, references, and learning materials uploaded by the tutor."
    />
  );
}