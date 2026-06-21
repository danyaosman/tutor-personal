import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { StatCard } from "@/components/tutor/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { overviewStats, performanceData, recentActivity, upcomingTasks, courses } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Plus, Users, FolderOpen, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/tutor/overview")({
  head: () => ({ meta: [{ title: "Overview — AI Tutor" }] }),
  component: Overview,
});

function Overview() {
  return (
    <TutorLayout
      title={`Welcome back, Maya 👋`}
      subtitle="Here's what's happening across your classes today."
      actions={
        <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
          <Plus className="h-4 w-4" /> New Course
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {overviewStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Class Performance Over Time</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Average quiz score across all active courses</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">+8% this term</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="perf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.2 268)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.62 0.2 268)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="week" stroke="oklch(0.5 0.025 260)" fontSize={12} />
                  <YAxis stroke="oklch(0.5 0.025 260)" fontSize={12} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.01 255)",
                      background: "white",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="oklch(0.55 0.22 268)" strokeWidth={2.5} fill="url(#perf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Upcoming Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((t) => (
              <div key={t.title} className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-3">
                <span className="text-sm font-medium">{t.title}</span>
                <Badge variant="outline">{t.due}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Student Activity</CardTitle>
            <button className="text-xs font-semibold text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {a.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm"><span className="font-semibold">{a.name}</span> <span className="text-muted-foreground">{a.action}</span></div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Courses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.slice(0, 3).map((c) => (
              <div key={c.id} className="rounded-xl border border-border/60 p-3 transition hover:bg-accent/40">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold leading-tight">{c.title}</h4>
                  <Badge
                    variant="secondary"
                    className={c.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : c.status === "Draft" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.students}</span>
                  <span className="inline-flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" /> {c.resources}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
