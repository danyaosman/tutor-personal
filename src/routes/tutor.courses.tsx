import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/courses")({
  component: TutorCoursesPage,
});

function TutorCoursesPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="كورسات المدرّس"
      badgeEn="Tutor Courses"
      titleAr="صفحة الكورسات"
      titleEn="Courses Page"
      descriptionAr="حالياً إدارة الكورسات الأساسية موجودة ضمن لوحة المدرّس وصفحة إنشاء التوأم الرقمي. يمكن لاحقاً تفعيل هذه الصفحة وربطها بالـ backend."
      descriptionEn="For now, course management is handled through the tutor dashboard and Digital Twin setup page. This page can later be connected to the backend."
    />
  );
}