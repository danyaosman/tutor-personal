import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/analytics")({
  component: TutorAnalyticsPage,
});

function TutorAnalyticsPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="تحليلات المدرّس"
      badgeEn="Tutor Analytics"
      titleAr="صفحة التحليلات"
      titleEn="Analytics Page"
      descriptionAr="هذه الصفحة غير مفعّلة حالياً ضمن النسخة الحالية من EduMind، ويمكن ربطها لاحقاً بالـ backend لعرض تحليلات حقيقية."
      descriptionEn="This page is not active in the current EduMind version and can later be connected to the backend for real analytics."
    />
  );
}