import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/tutor/overview")({
  head: () => ({ meta: [{ title: "Tutor - AI Tutor" }] }),
  component: TutorOverviewRedirect,
});

function TutorOverviewRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/tutor/courses", replace: true });
  }, [navigate]);

  return <div className="min-h-screen bg-background" />;
}
