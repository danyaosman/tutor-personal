import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { assignments } from "@/data/mockData";
import { CalendarClock, FileEdit, Plus, Users } from "lucide-react";

export const Route = createFileRoute("/tutor/assignments")({
  head: () => ({ meta: [{ title: "Assignments — AI Tutor" }] }),
  component: AssignmentsPage,
});

type Tab = "Active" | "Drafts" | "Archived";

function AssignmentsPage() {
  const [open, setOpen] = useState(false);
  const tabs: Tab[] = ["Active", "Drafts", "Archived"];

  return (
    <TutorLayout
      title="Assignments"
      subtitle="Track submissions, grading progress, and feedback."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
              <Plus className="h-4 w-4" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create new assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input placeholder="e.g. Build a Linear Regressor" /></div>
              <div><Label>Course</Label><Input placeholder="Pick a course" /></div>
              <div><Label>Description</Label><Textarea placeholder="Brief for students…" /></div>
              <div><Label>Due date</Label><Input type="date" /></div>
            </div>
            <DialogFooter>
              {/* TODO: connect to backend API */}
              <Button onClick={() => setOpen(false)} className="gradient-ai text-white">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs defaultValue="Active">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t} <span className="ml-1.5 text-xs text-muted-foreground">
                ({assignments.filter((a) => a.state === t).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {assignments
                .filter((a) => a.state === t)
                .map((a) => {
                  const submitPct = a.total ? Math.round((a.submitted / a.total) * 100) : 0;
                  const gradePct = a.submitted ? Math.round((a.graded / a.submitted) * 100) : 0;
                  return (
                    <Card key={a.id} className="shadow-soft transition hover:shadow-glow/40">
                      <CardHeader className="flex flex-row items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{a.title}</CardTitle>
                          <p className="mt-1 text-xs text-muted-foreground">{a.course}</p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <CalendarClock className="h-3 w-3" /> {a.due}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" /> Submissions
                            </span>
                            <span className="font-semibold">{a.submitted}/{a.total || "—"}</span>
                          </div>
                          <Progress value={submitPct} />
                        </div>
                        <div>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <FileEdit className="h-3.5 w-3.5" /> Grading
                            </span>
                            <span className="font-semibold">{gradePct}%</span>
                          </div>
                          <Progress value={gradePct} />
                        </div>
                        {/* TODO: connect to backend API */}
                        <Button variant="outline" size="sm" className="w-full">Open Assignment</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              {assignments.filter((a) => a.state === t).length === 0 && (
                <Card className="md:col-span-2 shadow-soft">
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    No assignments here yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </TutorLayout>
  );
}
