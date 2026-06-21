import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/tutor/ComingSoonPage";

export const Route = createFileRoute("/tutor/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Tutor" }] }),
  component: () => (
    <ComingSoonPage
      title="Settings"
      subtitle="Account, billing, integrations, and privacy."
      description="Manage your workspace, connected tools, and how your Digital Twin handles data."
    />
  ),
});
