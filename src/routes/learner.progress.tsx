import { createFileRoute } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { StatCard } from "@/components/tutor/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { learnerProfile, masteryOverTime, scoreBySubject, achievements } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/learner/progress")({
  head: () => ({ meta: [{ title: "My Progress — AI Tutor" }] }),
  component: LearnerProgress,
});

const stats = [
  { label: "Mastery", value: "78%", delta: "+6% this week", tone: "success" as const },
  { label: "Streak", value: "12d", delta: "Personal best!", tone: "warning" as const },
  { label: "Time on Task", value: "37h", delta: "+5h this week", tone: "blue" as const },
  { label: "XP", value: "4,820", delta: "1,180 to next level", tone: "purple" as const },
];

function LearnerProgress() {
  const xpPct = Math.round((learnerProfile.xp / learnerProfile.nextLevelXp) * 100);

  return (
    <LearnerLayout title="My Progress" subtitle="Track your mastery and celebrate the wins.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Level {learnerProfile.level}</div>
              <div className="text-sm text-muted-foreground">{learnerProfile.xp.toLocaleString()} / {learnerProfile.nextLevelXp.toLocaleString()} XP</div>
            </div>
            <div className="text-2xl font-extrabold">{xpPct}%</div>
          </div>
          <Progress value={xpPct} className="mt-3 h-3" />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Mastery Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={masteryOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)" }} />
                  <Line type="monotone" dataKey="mastery" stroke="oklch(0.6 0.18 220)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Score by Subject</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={scoreBySubject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="subject" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)" }} />
                  <Bar dataKey="score" fill="oklch(0.62 0.2 268)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((a) => (
              <div
                key={a.title}
                className={[
                  "rounded-xl border p-4 text-center transition",
                  a.earned ? "border-border bg-gradient-to-br from-cyan-500/10 to-blue-500/5" : "border-dashed border-border/60 opacity-50",
                ].join(" ")}
              >
                <div className="text-3xl">{a.icon}</div>
                <div className="mt-2 text-xs font-semibold">{a.title}</div>
                <div className="text-[10px] text-muted-foreground">{a.earned ? "Earned" : "Locked"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </LearnerLayout>
  );
}
