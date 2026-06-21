import { createFileRoute, Link } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiTutors } from "@/data/mockData";
import { Bot, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/learner/tutors")({
  head: () => ({ meta: [{ title: "AI Tutors — AI Tutor" }] }),
  component: LearnerTutors,
});

function LearnerTutors() {
  return (
    <LearnerLayout
      title="AI Tutors"
      subtitle="Each tutor is a Digital Twin of a real instructor. Start a session anytime."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {aiTutors.map((t) => (
          <Card key={t.id} className="relative overflow-hidden border-border/60 shadow-soft">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/0 blur-2xl" />
            <CardContent className="relative p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-glow">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold">{t.name}</h3>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" /> {t.rating}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.subject}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{t.style}</Badge>
                    <Badge variant="outline">{t.tone}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs italic text-muted-foreground">
                "{t.samplePrompt}"
              </div>

              <div className="mt-4 flex gap-2">
                {/* TODO: connect to AI model — initialize chat with this tutor's persona */}
                <Button className="flex-1 gradient-ai text-white shadow-glow" asChild>
                  <Link to="/learner/sessions"><Sparkles className="h-4 w-4" /> Start Session</Link>
                </Button>
                <Button variant="outline">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </LearnerLayout>
  );
}
