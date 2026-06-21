import { createFileRoute, Link } from "@tanstack/react-router";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { enrolledCourses } from "@/data/mockData";
import { BookOpen, Play, Search } from "lucide-react";

export const Route = createFileRoute("/learner/courses")({
  head: () => ({ meta: [{ title: "My Courses — AI Tutor" }] }),
  component: LearnerCourses,
});

const statusTone: Record<string, string> = {
  "In Progress": "bg-blue-500/10 text-blue-600",
  "Almost Done": "bg-amber-500/10 text-amber-600",
  "Completed": "bg-emerald-500/10 text-emerald-600",
};

function LearnerCourses() {
  return (
    <LearnerLayout
      title="My Courses"
      subtitle="Pick up where you left off, or browse the catalog."
      actions={
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow"><Search className="h-4 w-4" /> Browse Catalog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Browse the catalog</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              The full course catalog isn't wired up yet. {/* TODO: connect to backend API */}
            </p>
            <DialogFooter><Button variant="outline">Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enrolledCourses.map((c) => (
          <Card key={c.id} className="overflow-hidden border-border/60 shadow-soft transition hover:shadow-glow/40">
            <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold leading-tight">{c.title}</h3>
                <Badge variant="secondary" className={statusTone[c.status]}>{c.status}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">with {c.tutor}</div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.completed} / {c.lessons} lessons</span>
                  <span className="font-semibold">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="mt-2 h-2" />
              </div>

              <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs">
                <span className="text-muted-foreground">Up next: </span>
                <span className="font-semibold">{c.nextModule}</span>
              </div>

              <div className="mt-4 flex gap-2">
                {/* TODO: route to lesson player */}
                <Button className="flex-1 gradient-ai text-white shadow-glow"><Play className="h-4 w-4" /> Continue</Button>
                <Button variant="outline" asChild>
                  <Link to="/learner/resources"><BookOpen className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </LearnerLayout>
  );
}
