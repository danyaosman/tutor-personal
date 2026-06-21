import { createFileRoute } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { learnerWeakTopics } from "@/data/mockData";
import { Sparkles, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/learner/weaknesses")({
  head: () => ({ meta: [{ title: "Weak Spots — AI Tutor" }] }),
  component: LearnerWeaknesses,
});

const gapTone: Record<string, string> = {
  high: "bg-rose-500/10 text-rose-600",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-blue-500/10 text-blue-600",
};

function LearnerWeaknesses() {
  return (
    <LearnerLayout
      title="Weak Spots"
      subtitle="Your AI tutor analyzed your recent activity. Here's where to focus next."
      actions={
        // TODO: connect to AI analysis pipeline — generate a targeted practice set
        <Button className="gradient-ai text-white shadow-glow">
          <Sparkles className="h-4 w-4" /> Generate Practice Set
        </Button>
      }
    >
      <Card className="border-amber-500/30 bg-amber-500/5 shadow-soft">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="text-sm">
            <div className="font-semibold">5 topics need attention.</div>
            <div className="text-muted-foreground">Fixing these would lift your overall mastery by ~9 points.</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-soft">
        <CardHeader><CardTitle>Top Weak Topics</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border">
          {learnerWeakTopics.map((w) => (
            <div key={w.topic} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[2fr_1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{w.topic}</span>
                  <Badge variant="secondary" className={gapTone[w.gap]}>{w.gap} gap</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Recommended: {w.action}</div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className="font-semibold">{w.mastery}%</span>
                </div>
                <Progress value={w.mastery} className="mt-1 h-2" />
              </div>
              <Button variant="outline" className="md:justify-self-end">Practice now</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </LearnerLayout>
  );
}
