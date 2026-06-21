import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { quizzes } from "@/data/mockData";
import { Plus, Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/tutor/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — AI Tutor" }] }),
  component: QuizzesPage,
});

const statusTone: Record<string, string> = {
  Published: "bg-emerald-500/10 text-emerald-600",
  Draft: "bg-amber-500/10 text-amber-600",
  Scheduled: "bg-blue-500/10 text-blue-600",
};

function QuizzesPage() {
  const [open, setOpen] = useState(false);
  return (
    <TutorLayout
      title="Quizzes"
      subtitle="Create, schedule, and review quizzes across your courses."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
              <Plus className="h-4 w-4" /> Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input placeholder="e.g. Recursion Patterns" />
              </div>
              <div>
                <Label>Course</Label>
                <Input placeholder="Pick a course" />
              </div>
              <div>
                <Label>Notes for AI generator</Label>
                <Textarea placeholder="Focus on edge cases and tail recursion…" />
              </div>
            </div>
            <DialogFooter>
              {/* TODO: connect to backend API */}
              <Button onClick={() => setOpen(false)} className="gradient-ai text-white">
                Create Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="relative overflow-hidden border-primary/20 shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-cyan-500/10" />
        <CardContent className="relative flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Generate a quiz with your Digital Twin</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a topic and your AI twin drafts questions in seconds.
              </p>
            </div>
          </div>
          {/* TODO: connect to AI model */}
          <Button variant="outline" className="border-primary/30">
            <Wand2 className="h-4 w-4" /> Generate with AI
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-soft">
        <CardHeader><CardTitle>All Quizzes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell className="text-muted-foreground">{q.course}</TableCell>
                  <TableCell className="text-center">{q.questions}</TableCell>
                  <TableCell className="text-center">{q.attempts}</TableCell>
                  <TableCell className="text-center">{q.avg ? `${q.avg}%` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusTone[q.status]}>{q.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TutorLayout>
  );
}
