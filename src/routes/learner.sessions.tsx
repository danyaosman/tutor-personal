import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/sessions")({
  component: LearnerSessionsPage,
});

function LearnerSessionsPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="جلسات التعلم"
      badgeEn="Learning Sessions"
      titleAr="صفحة الجلسات"
      titleEn="Sessions Page"
      descriptionAr="هنا يمكن لاحقاً عرض جلسات المتعلم السابقة مع المدرّس الذكي، المحادثات المحفوظة، وآخر نشاط داخل الكورسات."
      descriptionEn="This page can later show previous AI Tutor sessions, saved conversations, and recent course activity."
    />
  );
}