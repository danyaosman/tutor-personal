import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/tutor/resources")({
  component: () => <RedirectToCourses />,
});

function RedirectToCourses() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/tutor/courses", replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background" />;
}
