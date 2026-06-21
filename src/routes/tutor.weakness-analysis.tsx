import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { weaknessTopics, topWeakTopics } from "@/data/mockData";
import { AlertTriangle, Brain, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tutor/weakness-analysis")({
  head: () => ({ meta: [{ title: "Weakness Analysis — AI Tutor" }] }),
  component: WeaknessPage,
});

// Lower score = bigger weakness. Map 0–100 to a red intensity.
function heatStyle(score: number) {
  const weakness = 100 - score; // 0..100
  const opacity = Math.min(1, weakness / 70).toFixed(2);
  return {
    backgroundColor: `oklch(0.7 0.18 25 / ${opacity})`,
  };
}

function WeaknessPage() {
  return (
    <TutorLayout
      title="Weakness Analysis"
      subtitle="AI-detected gaps in understanding across topics and difficulty levels."
      actions={
        // TODO: connect to AI model
        <Button variant="outline" className="border-primary/30">
          <Sparkles className="h-4 w-4" /> Re-run AI analysis
        </Button>
      }
    >
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Topic × Difficulty Heatmap</CardTitle>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Average mastery score. Darker red = larger knowledge gap.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[160px_1fr_1fr_1fr] gap-2 text-xs font-semibold text-muted-foreground">
                <div />
                <div className="text-center">Beginner</div>
                <div className="text-center">Intermediate</div>
                <div className="text-center">Advanced</div>
              </div>
              <div className="mt-2 space-y-2">
                {weaknessTopics.map((t) => (
                  <div key={t.topic} className="grid grid-cols-[160px_1fr_1fr_1fr] gap-2">
                    <div className="flex items-center text-sm font-medium">{t.topic}</div>
                    {([t.beginner, t.intermediate, t.advanced] as const).map((score, i) => (
                      <div
                        key={i}
                        className="grid h-12 place-items-center rounded-lg border border-border/40 text-sm font-bold"
                        style={heatStyle(score)}
                      >
                        {score}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Top 5 Weak Topics</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Action needed</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {topWeakTopics.map((t, i) => (
              <div key={t.topic} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-rose-500/10 text-sm font-bold text-rose-600">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{t.topic}</div>
                    <div className="text-xs text-muted-foreground">{t.affected} students affected</div>
                  </div>
                </div>
                {/* TODO: connect to AI model */}
                <Button size="sm" variant="outline">{t.action}</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-soft">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan-500/10" />
          <CardHeader className="relative"><CardTitle>Per-Student Drilldown</CardTitle></CardHeader>
          <CardContent className="relative space-y-3">
            <p className="text-sm text-muted-foreground">
              Sofia Müller shows consistent gaps in <strong>Backpropagation</strong> and{" "}
              <strong>Probability</strong>. The AI suggests a 20-minute focused review session.
            </p>
            {/* TODO: connect to AI model */}
            <Button className="w-full gradient-ai text-white">
              <Sparkles className="h-4 w-4" /> Generate plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
