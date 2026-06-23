import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../lib/PlaceholderPage";

export const Route = createFileRoute("/tutor/settings")({
  component: TutorSettingsPage,
});

function TutorSettingsPage() {
  return (
    <PlaceholderPage
      role="tutor"
      badgeAr="إعدادات المدرّس"
      badgeEn="Tutor Settings"
      titleAr="صفحة الإعدادات"
      titleEn="Settings Page"
      descriptionAr="هذه الصفحة غير أساسية حالياً، ويمكن لاحقاً استخدامها لتعديل الحساب، اللغة، والإشعارات."
      descriptionEn="This page is not essential right now and can later be used for account, language, and notification settings."
    />
  );
}