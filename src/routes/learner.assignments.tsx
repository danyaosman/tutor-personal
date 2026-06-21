import { createFileRoute } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { learnerAssignments } from "@/data/mockData";
import { CalendarClock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/learner/assignments")({
  head: () => ({ meta: [{ title: "Assignments — AI Tutor" }] }),
  component: LearnerAssignments,
});

const stateTone: Record<string, string> = {
  "To Do": "bg-blue-500/10 text-blue-600",
  Submitted: "bg-amber-500/10 text-amber-600",
  Graded: "bg-emerald-500/10 text-emerald-600",
};

function AssignmentCard({ a }: { a: typeof learnerAssignments[number] }) {
  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={stateTone[a.state]}>{a.state}</Badge>
            <span className="text-xs text-muted-foreground">{a.course}</span>
          </div>
          <h3 className="mt-1 text-base font-bold">{a.title}</h3>
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> {a.due}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {a.grade !== null && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Grade</div>
              <div className="text-xl font-extrabold text-emerald-600">{a.grade}%</div>
            </div>
          )}
          {/* TODO: connect to backend API — open assignment / submit */}
          {a.state === "To Do" && <Button className="gradient-ai text-white shadow-glow">Open</Button>}
          {a.state === "Submitted" && <Button variant="outline">View Submission</Button>}
          {a.state === "Graded" && (
            <Button variant="outline"><CheckCircle2 className="h-4 w-4" /> View Feedback</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LearnerAssignments() {
  const todo = learnerAssignments.filter((a) => a.state === "To Do");
  const submitted = learnerAssignments.filter((a) => a.state === "Submitted");
  const graded = learnerAssignments.filter((a) => a.state === "Graded");

  return (
    <LearnerLayout title="Assignments" subtitle="Submit your work and track your grades.">
      <Tabs defaultValue="todo">
        <TabsList>
          <TabsTrigger value="todo">To Do ({todo.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="todo" className="mt-4 space-y-3">
          {todo.map((a) => <AssignmentCard key={a.id} a={a} />)}
        </TabsContent>
        <TabsContent value="submitted" className="mt-4 space-y-3">
          {submitted.map((a) => <AssignmentCard key={a.id} a={a} />)}
        </TabsContent>
        <TabsContent value="graded" className="mt-4 space-y-3">
          {graded.map((a) => <AssignmentCard key={a.id} a={a} />)}
        </TabsContent>
      </Tabs>
    </LearnerLayout>
  );
}
