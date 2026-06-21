import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/analytics")({
  head: () => ({ meta: [{ title: "Student Analytics — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Student Analytics"
      subtitle="Deep insights into every learner's journey."
      description="See engagement, mastery, and progress trends per student, per topic, and across cohorts."
    />
  ),
});
