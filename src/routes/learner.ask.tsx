import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enrolledCourses, learnerPastQuestions } from "@/data/mockData";
import { Paperclip, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/learner/ask")({
  head: () => ({ meta: [{ title: "Ask a Tutor — AI Tutor" }] }),
  component: LearnerAsk,
});

const statusTone: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-600",
  Replied: "bg-amber-500/10 text-amber-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
};

function LearnerAsk() {
  const [question, setQuestion] = useState("");

  return (
    <LearnerLayout title="Ask a Tutor" subtitle="Send your question to your tutor — get an AI-suggested answer instantly.">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>New Question</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g. Why does gradient descent diverge?" className="mt-1" />
              </div>
              <div>
                <Label>Course</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pick a course" /></SelectTrigger>
                  <SelectContent>
                    {enrolledCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="q">Your question</Label>
              <Textarea
                id="q"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe what you're stuck on. Add context, what you tried, and what didn't work."
                className="mt-1 min-h-[160px]"
              />
            </div>

            <div className="rounded-xl border border-dashed border-border/60 bg-secondary/30 p-4 text-center">
              <Paperclip className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-1 text-sm font-semibold">Drop a screenshot or file</div>
              <div className="text-xs text-muted-foreground">PNG, PDF, code snippets — up to 10MB</div>
              {/* TODO: connect to file storage */}
            </div>

            <Card className="border-primary/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI Suggested Answer
                </div>
                <p className="mt-2 text-sm">
                  {question.trim().length > 8
                    ? "Based on your question, this looks like a learning-rate issue. Try lowering it by 10× and add gradient clipping. If the loss still diverges, check feature scaling."
                    : "Start typing your question — your AI tutor will draft a suggested answer here in real time."}
                </p>
                {/* TODO: connect to AI model */}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Save Draft</Button>
              {/* TODO: connect to backend API — submit question */}
              <Button className="gradient-ai text-white shadow-glow"><Send className="h-4 w-4" /> Send to Tutor</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Your Questions</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {learnerPastQuestions.map((q) => (
              <div key={q.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{q.subject}</span>
                  <Badge variant="secondary" className={statusTone[q.status]}>{q.status}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{q.course} · {q.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
}
