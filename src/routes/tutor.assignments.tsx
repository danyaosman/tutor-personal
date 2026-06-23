import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/assignments")({
  component: TutorAssignmentsPage,
});

function TutorAssignmentsPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="واجبات المدرّس"
      badgeEn="Tutor Assignments"
      titleAr="صفحة الواجبات"
      titleEn="Assignments Page"
      descriptionAr="هذه الصفحة غير مستخدمة حالياً في المسار الأساسي، ويمكن تطويرها لاحقاً عند إضافة نظام واجبات حقيقي."
      descriptionEn="This page is not used in the core flow yet and can be developed later when a real assignments system is added."
    />
  );
}