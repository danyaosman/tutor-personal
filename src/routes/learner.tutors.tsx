import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/tutors")({
  component: LearnerTutorsPage,
});

function LearnerTutorsPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="المدرّسون"
      badgeEn="Tutors"
      titleAr="صفحة المدرّسين"
      titleEn="Tutors Page"
      descriptionAr="هنا يمكن لاحقاً عرض المدرّسين المتاحين، كورساتهم، والتوائم الرقمية المرتبطة بكل مدرس."
      descriptionEn="This page can later show available tutors, their courses, and the Digital Twins connected to each tutor."
    />
  );
}