import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { StatCard } from "@/components/tutor/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
} from "recharts";
import {
  analyticsStats, engagementTrend, coursePerformance, topStudents, strugglingStudents,
} from "@/data/mockData";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export const Route = createFileRoute("/tutor/analytics")({
  head: () => ({ meta: [{ title: "Student Analytics — AI Tutor" }] }),
  component: AnalyticsPage,
});

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-rose-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function AnalyticsPage() {
  return (
    <TutorLayout
      title="Student Analytics"
      subtitle="Engagement, performance, and progress at a glance."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {analyticsStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Engagement Over Time</CardTitle>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Last 8 weeks</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={engagementTrend} margin={{ top: 10, right: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="week" stroke="oklch(0.5 0.025 260)" fontSize={12} />
                  <YAxis stroke="oklch(0.5 0.025 260)" fontSize={12} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.01 255)",
                      background: "white",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Line type="monotone" dataKey="engagement" stroke="oklch(0.62 0.2 220)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Performance by Course</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={coursePerformance} margin={{ top: 10, right: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="course" stroke="oklch(0.5 0.025 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.5 0.025 260)" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.01 255)",
                      background: "white",
                    }}
                  />
                  <Bar dataKey="score" fill="oklch(0.62 0.2 268)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Top Students</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {topStudents.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-bold">
                    {s.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.course}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={s.trend} />
                  <span className="text-sm font-bold">{s.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Needs Attention</CardTitle>
            <Badge variant="secondary" className="bg-rose-500/10 text-rose-600">At risk</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {strugglingStudents.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-600">
                    {s.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.course}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={s.trend} />
                  <span className="text-sm font-bold">{s.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
