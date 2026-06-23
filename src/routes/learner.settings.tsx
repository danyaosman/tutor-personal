import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/learner/settings")({
  component: LearnerSettingsPage,
});

function LearnerSettingsPage() {
  return (
    <PlaceholderPage
      role="learner"
      badgeAr="إعدادات المتعلم"
      badgeEn="Learner Settings"
      titleAr="صفحة الإعدادات"
      titleEn="Settings Page"
      descriptionAr="هنا يمكن لاحقاً تعديل معلومات الحساب، اللغة، الإشعارات، وتفضيلات تجربة التعلم داخل المنصة."
      descriptionEn="This page can later manage account details, language, notifications, and learner experience preferences."
    />
  );
}