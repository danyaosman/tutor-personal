import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/weakness-analysis")({
  head: () => ({ meta: [{ title: "Weakness Analysis — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Weakness Analysis"
      subtitle="Pinpoint concepts students struggle with."
      description="Your Digital Twin identifies recurring weak spots and recommends targeted interventions."
    />
  ),
});
