import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/learner")({
  component: LearnerPlaceholder,
});

function LearnerPlaceholder() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 gradient-ai-soft opacity-60" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-ai text-white shadow-glow">
          <BookOpenCheck className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Learner Dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          The Learner experience is coming soon. Stay tuned — we're building something delightful.
        </p>
        <Link
          to="/select-role"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Role Select
        </Link>
      </div>
    </div>
  );
}
