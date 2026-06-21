import { createFileRoute, Link } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { StatCard } from "@/components/tutor/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  learnerProfile,
  learnerStats,
  continueLearning,
  todaysTasks,
  recentSessions,
  enrolledCourses,
} from "@/data/mockData";
import { Play, BookOpen, Sparkles, MessagesSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/learner/")({
  head: () => ({ meta: [{ title: "Overview — AI Tutor (Learner)" }] }),
  component: LearnerOverview,
});

function LearnerOverview() {
  const next = enrolledCourses.find((c) => c.status === "In Progress") ?? enrolledCourses[0];

  return (
    <LearnerLayout
      title={`Welcome back, ${learnerProfile.name.split(" ")[0]} 👋`}
      subtitle={`You're on a ${learnerProfile.streak}-day streak. Keep it going!`}
      actions={
        <Button className="gradient-ai text-white shadow-glow hover:opacity-90" asChild>
          <Link to="/learner/sessions"><Sparkles className="h-4 w-4" /> Ask AI Tutor</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {learnerStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Continue learning hero */}
        <Card className="lg:col-span-2 relative overflow-hidden border-border/60 shadow-soft">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />
          <CardContent className="relative p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Continue Learning</div>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">{continueLearning.lesson}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{continueLearning.course} · {continueLearning.module}</p>
              </div>
              <Badge className="gradient-ai text-white shadow-glow">With {continueLearning.tutor}</Badge>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Module progress</span><span className="font-semibold text-foreground">{continueLearning.progress}%</span>
              </div>
              <Progress value={continueLearning.progress} className="mt-2 h-2" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {/* TODO: wire to actual lesson route once learner lesson player exists */}
              <Button className="gradient-ai text-white shadow-glow"><Play className="h-4 w-4" /> Resume Lesson</Button>
              <Button variant="outline" asChild>
                <Link to="/learner/courses"><BookOpen className="h-4 w-4" /> All Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Today's Plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.map((t) => (
              <div key={t.title} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground">{t.kind}</div>
                </div>
                <Badge variant="outline" className="shrink-0">{t.due}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent AI Tutor Sessions</CardTitle>
            <Link to="/learner/sessions" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <MessagesSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{s.tutor}</span>
                    <Badge variant="secondary" className="text-[10px]">{s.subject}</Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{s.preview}</div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{s.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recommended Next</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {/* TODO: connect to AI model recommendation engine */}
            <div className="rounded-xl border border-border/60 p-3">
              <div className="text-xs font-semibold uppercase text-primary">Practice</div>
              <div className="mt-1 text-sm font-semibold">Big-O Sprint (20 Q)</div>
              <div className="text-xs text-muted-foreground">Targets your weakest topic</div>
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link to="/learner/quizzes">Start</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-border/60 p-3">
              <div className="text-xs font-semibold uppercase text-primary">Lesson</div>
              <div className="mt-1 text-sm font-semibold">{next.nextModule}</div>
              <div className="text-xs text-muted-foreground">{next.title}</div>
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link to="/learner/courses">Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
}
