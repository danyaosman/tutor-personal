import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/requests")({
  head: () => ({ meta: [{ title: "Requests — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Requests"
      subtitle="Student questions, escalations, and meeting requests."
      description="One inbox for everything students need from you — including conversations escalated by your Digital Twin."
    />
  ),
});
