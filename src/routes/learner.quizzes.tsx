import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { learnerQuizzes } from "@/data/mockData";
import { Play } from "lucide-react";

export const Route = createFileRoute("/learner/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — AI Tutor" }] }),
  component: LearnerQuizzes,
});

const statusTone: Record<string, string> = {
  Available: "bg-blue-500/10 text-blue-600",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Retake: "bg-amber-500/10 text-amber-600",
};

function LearnerQuizzes() {
  const [active, setActive] = useState<null | typeof learnerQuizzes[number]>(null);

  return (
    <LearnerLayout title="Quizzes" subtitle="Test what you know — quizzes adapt to your level.">
      <Card className="shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quiz</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Best Score</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learnerQuizzes.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-semibold">{q.title}</TableCell>
                <TableCell className="text-muted-foreground">{q.course}</TableCell>
                <TableCell className="text-right">{q.questions}</TableCell>
                <TableCell className="text-right">{q.best !== null ? `${q.best}%` : "—"}</TableCell>
                <TableCell className="text-right">{q.attempts}</TableCell>
                <TableCell><Badge variant="secondary" className={statusTone[q.status]}>{q.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="gradient-ai text-white shadow-glow" onClick={() => setActive(q)}>
                    <Play className="h-3.5 w-3.5" /> {q.status === "Completed" ? "Review" : "Start"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active?.title}</DialogTitle></DialogHeader>
          {/* TODO: connect to backend API — fetch real questions */}
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">Sample question 1 of {active?.questions}</div>
            <div className="text-sm font-semibold">Which of the following best describes overfitting?</div>
            <RadioGroup defaultValue="a" className="space-y-2">
              <div className="flex items-center gap-2"><RadioGroupItem value="a" id="a" /><Label htmlFor="a">The model memorizes the training data and fails on new data</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="b" id="b" /><Label htmlFor="b">The model is too simple to learn the patterns</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="c" id="c" /><Label htmlFor="c">The model trains faster than expected</Label></div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button className="gradient-ai text-white">Submit Answer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LearnerLayout>
  );
}
