import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/learner/")({
  head: () => ({ meta: [{ title: "Learner - AI Tutor" }] }),
  component: LearnerHomeRedirect,
});

function LearnerHomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/learner/courses", replace: true });
  }, [navigate]);

  return <div className="min-h-screen bg-background" />;
}
