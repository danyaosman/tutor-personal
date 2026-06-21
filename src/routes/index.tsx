import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 gradient-ai-soft opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[28rem] w-[28rem] rounded-full gradient-ai opacity-30 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-ai shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">AI Tutor</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Sign in</Link>
          <Link to="/register" className="rounded-md gradient-ai px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90">
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Personalized AI tutoring, built by educators
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Teach with your own <span className="text-gradient-ai">AI twin</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Build a digital teaching twin trained on your style, materials, and voice — so every student gets a personal tutor that sounds like you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg gradient-ai px-5 py-3 text-sm font-semibold text-white shadow-glow hover:opacity-90">
            Create your twin <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-input bg-card/70 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-accent">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
