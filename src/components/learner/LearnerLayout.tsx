import type { ReactNode } from "react";
import { Bell, Flame, Search } from "lucide-react";
import { LearnerSidebarNav } from "./LearnerSidebarNav";
import { learnerProfile } from "@/data/mockData";

export function LearnerLayout({ title, subtitle, actions, children }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <LearnerSidebarNav />
      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="hidden md:flex relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, lessons, tutors…"
              className="w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="md:hidden text-sm font-semibold">AI Tutor</div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600">
              <Flame className="h-3.5 w-3.5" /> {learnerProfile.streak}-day streak
            </div>
            <button className="rounded-md border border-input p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
