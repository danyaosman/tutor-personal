import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/syllabus")({
  component: TutorSyllabusPage,
});

function TutorSyllabusPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="خطة الكورس"
      badgeEn="Course Syllabus"
      titleAr="صفحة الخطة الدراسية"
      titleEn="Syllabus Page"
      descriptionAr="هذه الصفحة غير مستخدمة حالياً، لأن معلومات الكورس والأهداف التعليمية موجودة ضمن صفحة إنشاء التوأم الرقمي."
      descriptionEn="This page is not used right now because course information and learning goals are handled inside the Digital Twin setup page."
    />
  );
}