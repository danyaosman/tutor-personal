import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/select-role")({
  component: SelectRole,
});

function SelectRole() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 gradient-ai-soft opacity-70" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full gradient-ai opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full gradient-ai opacity-20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-ai shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">AI Tutor</span>
        </Link>

        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How will you use AI Tutor?
        </h1>
        <p className="mt-3 max-w-xl text-center text-muted-foreground">
          Choose the workspace that matches the backend-supported demo flow.
        </p>

        <div className="mt-10 grid w-full gap-5 sm:grid-cols-2">
          <RoleCard
            to="/tutor/courses"
            icon={<GraduationCap className="h-7 w-7" />}
            title="I'm a Tutor"
            description="Create courses, upload PDFs, and prepare materials learners use with AI."
            cta="Enter tutor workspace"
          />
          <RoleCard
            to="/learner/courses"
            icon={<BookOpenCheck className="h-7 w-7" />}
            title="I'm a Learner"
            description="Enroll in courses, ask the AI tutor, take quizzes, and review flashcards."
            cta="Go to learner space"
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  to,
  icon,
  title,
  description,
  cta,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-7 shadow-soft backdrop-blur-md transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/10 opacity-0 transition group-hover:opacity-100" />
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-ai text-white shadow-glow">
          {icon}
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
