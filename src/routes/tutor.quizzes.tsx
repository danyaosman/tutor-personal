import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/quizzes")({
  component: TutorQuizzesPage,
});

function TutorQuizzesPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="اختبارات المدرّس"
      badgeEn="Tutor Quizzes"
      titleAr="صفحة الاختبارات"
      titleEn="Quizzes Page"
      descriptionAr="هذه الصفحة غير مفعّلة حالياً، لأن نتائج الاختبارات الأساسية تظهر ضمن صفحة تحليل نقاط الضعف."
      descriptionEn="This page is not active yet because the main quiz results are currently shown in the weakness analysis page."
    />
  );
}