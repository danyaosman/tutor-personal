import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/assignments")({
  head: () => ({ meta: [{ title: "Assignments — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Assignments"
      subtitle="Create, distribute, and grade assignments."
      description="Manage student submissions, give AI-assisted feedback, and track completion across cohorts."
    />
  ),
});
