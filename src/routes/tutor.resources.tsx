import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/resources")({
  component: TutorResourcesPage,
});

function TutorResourcesPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="مصادر المدرّس"
      badgeEn="Tutor Resources"
      titleAr="صفحة المصادر"
      titleEn="Resources Page"
      descriptionAr="رفع المصادر الأساسي موجود حالياً داخل صفحة إنشاء التوأم الرقمي. يمكن لاحقاً ربط هذه الصفحة بالـ backend كمكتبة ملفات كاملة."
      descriptionEn="The main resource upload flow is currently inside the Digital Twin setup page. This page can later become a full backend-connected resource library."
    />
  );
}