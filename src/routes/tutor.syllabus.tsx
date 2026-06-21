import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/syllabus")({
  head: () => ({ meta: [{ title: "Syllabus & Goals — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Syllabus & Goals"
      subtitle="Define your curriculum and learning outcomes."
      description="Plan your syllabus, set weekly learning goals, and let your Digital Twin align lessons automatically."
    />
  ),
});
