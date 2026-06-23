import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/requests")({
  component: TutorRequestsPage,
});

function TutorRequestsPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="طلبات المتعلمين"
      badgeEn="Learner Requests"
      titleAr="صفحة الطلبات"
      titleEn="Requests Page"
      descriptionAr="هذه الصفحة غير مستخدمة حالياً ضمن متطلبات EduMind الأساسية، ويمكن تفعيلها لاحقاً عند إضافة نظام طلبات."
      descriptionEn="This page is not used in the current EduMind requirements and can be activated later when a request system is added."
    />
  );
}