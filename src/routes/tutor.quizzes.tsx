import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Quizzes"
      subtitle="Auto-generate and review student quizzes."
      description="Generate quizzes from your course materials, review submissions, and let the Digital Twin grade with rubrics."
    />
  ),
});
