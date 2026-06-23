import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FolderOpen, Plus, Users } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, listCourses, type CourseStatus } from "@/lib/api";

export const Route = createFileRoute("/tutor/courses")({
  head: () => ({ meta: [{ title: "Courses - AI Tutor" }] }),
  component: CoursesPage,
});

const courseQueryKey = ["courses"] as const;

const statusStyles: Record<CourseStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  draft: "bg-amber-500/10 text-amber-600",
  archived: "bg-muted text-muted-foreground",
};

function CoursesPage() {
  const [open, setOpen] = useState(false);
  const [courseStatus, setCourseStatus] = useState<CourseStatus>("draft");
  const queryClient = useQueryClient();
  const coursesQuery = useQuery({
    queryKey: courseQueryKey,
    queryFn: listCourses,
  });
  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseQueryKey }),
  });

  return (
    <TutorLayout
      title="My Courses"
      subtitle="Create, manage, and organize the courses you teach."
      actions={
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) createCourseMutation.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
              <Plus className="h-4 w-4" /> Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new course</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const formElement = event.currentTarget;
                const form = new FormData(formElement);

                try {
                  await createCourseMutation.mutateAsync({
                    title: String(form.get("title")),
                    description: String(form.get("description")),
                    subject: String(form.get("subject")),
                    grade_level: String(form.get("grade_level")),
                    status: courseStatus,
                  });
                  formElement.reset();
                  setCourseStatus("draft");
                  setOpen(false);
                } catch {
                  // React Query exposes the request error below.
                }
              }}
            >
              {createCourseMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>{createCourseMutation.error.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Intro to Machine Learning"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What students will learn..."
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Computer Science" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="grade_level">Grade</Label>
                  <Input id="grade_level" name="grade_level" placeholder="e.g. Grade 10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={courseStatus}
                  onValueChange={(value) => setCourseStatus(value as CourseStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="gradient-ai text-white"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {coursesQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading courses...
        </Card>
      )}

      {coursesQuery.error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{coursesQuery.error.message}</span>
            <Button size="sm" variant="outline" onClick={() => coursesQuery.refetch()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {coursesQuery.data?.length === 0 && (
        <Card className="border-dashed p-10 text-center shadow-soft">
          <BookOpen className="mx-auto h-9 w-9 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first course to begin building your Digital Twin.
          </p>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {coursesQuery.data?.map((course) => (
          <Card
            key={course.id}
            className="group relative overflow-hidden border-border/60 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="h-1.5 gradient-ai" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold leading-tight">{course.title}</h3>
                <Badge variant="secondary" className={statusStyles[course.status]}>
                  {course.status[0].toUpperCase() + course.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-medium text-primary">
                {course.subject} - {course.grade_level}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {course.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {course.student_count} students
                </span>
                <span className="inline-flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" /> {course.resource_count} resources
                </span>
              </div>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link to="/tutor/courses/$courseId" params={{ courseId: String(course.id) }}>
                  Open Course <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </TutorLayout>
  );
}
