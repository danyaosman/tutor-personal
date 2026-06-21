import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { syllabi, learningGoals } from "@/data/mockData";
import { Plus, Target, BookMarked } from "lucide-react";

export const Route = createFileRoute("/tutor/syllabus")({
  head: () => ({ meta: [{ title: "Syllabus & Goals — AI Tutor" }] }),
  component: SyllabusPage,
});

const statusTone: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-600",
  "In Progress": "bg-blue-500/10 text-blue-600",
  Planned: "bg-muted text-muted-foreground",
};

function SyllabusPage() {
  return (
    <TutorLayout
      title="Syllabus & Goals"
      subtitle="Plan course modules and track learning outcomes."
      actions={
        // TODO: connect to backend API
        <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Module
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {syllabi.map((s) => (
            <Card key={s.course} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                  <CardTitle>{s.course}</CardTitle>
                </div>
                <Badge variant="outline">{s.modules.length} modules</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.modules.map((m, i) => (
                  <div
                    key={m.title}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-3 transition hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-background text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{m.title}</div>
                        <div className="text-xs text-muted-foreground">{m.weeks}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusTone[m.status]}>{m.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Learning Goals</CardTitle>
            </div>
            {/* TODO: connect to backend API */}
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {learningGoals.map((g) => (
              <div key={g.title}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
