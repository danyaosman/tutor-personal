import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courses } from "@/data/mockData";
import { Plus, Users, FolderOpen, Settings2 } from "lucide-react";

export const Route = createFileRoute("/tutor/courses")({
  head: () => ({ meta: [{ title: "Courses — AI Tutor" }] }),
  component: CoursesPage,
});

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600",
  Draft: "bg-amber-500/10 text-amber-600",
  Archived: "bg-muted text-muted-foreground",
};

function CoursesPage() {
  const [open, setOpen] = useState(false);

  return (
    <TutorLayout
      title="My Courses"
      subtitle="Create, manage, and organize the courses you teach."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow hover:opacity-90"><Plus className="h-4 w-4" /> Add New Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a new course</DialogTitle></DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: connect to backend API
                setOpen(false);
              }}
            >
              <div className="space-y-1.5"><Label>Title</Label><Input placeholder="e.g. Intro to Machine Learning" /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} placeholder="What students will learn…" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Subject</Label><Input placeholder="Computer Science" /></div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select defaultValue="Draft">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="gradient-ai text-white">Create Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="group relative overflow-hidden border-border/60 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
            <div className="h-1.5 gradient-ai" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold leading-tight">{c.title}</h3>
                <Badge variant="secondary" className={statusStyles[c.status]}>{c.status}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.students} students</span>
                <span className="inline-flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" /> {c.resources} resources</span>
              </div>
              <Button variant="outline" className="mt-5 w-full">
                <Settings2 className="h-4 w-4" /> Manage Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </TutorLayout>
  );
}
