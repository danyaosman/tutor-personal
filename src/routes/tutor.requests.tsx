import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { studentRequests } from "@/data/mockData";
import { Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/tutor/requests")({
  head: () => ({ meta: [{ title: "Requests — AI Tutor" }] }),
  component: RequestsPage,
});

const statusTone: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-600",
  Replied: "bg-amber-500/10 text-amber-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
};

function RequestsPage() {
  const [activeId, setActiveId] = useState(studentRequests[0].id);
  const active = studentRequests.find((r) => r.id === activeId)!;

  return (
    <TutorLayout
      title="Student Requests"
      subtitle="Questions and help requests routed from your courses."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inbox</CardTitle>
            <Badge variant="secondary">{studentRequests.length}</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {studentRequests.map((r) => {
              const isActive = r.id === activeId;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`w-full px-5 py-3 text-left transition hover:bg-accent/40 ${
                    isActive ? "bg-accent/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{r.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{r.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.preview}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{r.course}</Badge>
                        <Badge variant="secondary" className={`text-[10px] ${statusTone[r.status]}`}>{r.status}</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>{active.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {active.course} • {active.time}
                </p>
              </div>
              <Badge variant="secondary" className={statusTone[active.status]}>{active.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{active.body}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-primary/20 shadow-soft">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
            <CardHeader className="relative flex flex-row items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">AI-suggested reply</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <p className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm leading-relaxed text-muted-foreground">
                Great question! BFS guarantees shortest paths in unweighted graphs because it explores level
                by level — try walking through a small 4-node graph and tracking the queue.
              </p>
              {/* TODO: connect to AI model */}
              <Button variant="outline" size="sm" className="border-primary/30">
                <Sparkles className="h-4 w-4" /> Regenerate
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle>Quick reply</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Write a reply…" rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save draft</Button>
                {/* TODO: connect to backend API */}
                <Button className="gradient-ai text-white">
                  <Send className="h-4 w-4" /> Send reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}
