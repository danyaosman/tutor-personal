import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  enrollInCourse,
  listAvailableCourses,
  listEnrolledCourses,
  type LearnerCourse,
} from "@/lib/api";
import { BookOpen, MessageCircle, Play, Search, Users } from "lucide-react";

export const Route = createFileRoute("/learner/courses")({
  head: () => ({ meta: [{ title: "My Courses - AI Tutor" }] }),
  component: LearnerCourses,
});

function LearnerCourses() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const normalizedPathname = pathname.replace(/\/$/, "");

  if (normalizedPathname !== "/learner/courses") {
    return <Outlet />;
  }

  return <LearnerCoursesList />;
}

function LearnerCoursesList() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const enrolledCoursesQuery = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: listEnrolledCourses,
  });
  const availableCoursesQuery = useQuery({
    queryKey: ["available-courses"],
    queryFn: listAvailableCourses,
  });
  const enrollMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["available-courses"] }),
      ]);
      setCatalogOpen(false);
      setSearchQuery("");
    },
  });
  const filteredAvailableCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return availableCoursesQuery.data ?? [];

    return (availableCoursesQuery.data ?? []).filter((course) =>
      [
        course.title,
        course.teacher_name,
        course.subject,
        course.grade_level,
        course.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [availableCoursesQuery.data, searchQuery]);

  return (
    <LearnerLayout
      title="My Courses"
      subtitle="View your enrolled courses or browse active courses from tutors."
      actions={
        <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-ai text-white shadow-glow">
              <Search className="h-4 w-4" /> Browse Catalog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Browse active courses</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, teacher, subject, or description..."
                className="pl-9"
              />
            </div>
            {availableCoursesQuery.isPending && (
              <p className="text-sm text-muted-foreground">Loading active courses...</p>
            )}
            {availableCoursesQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>{availableCoursesQuery.error.message}</AlertDescription>
              </Alert>
            )}
            {enrollMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>{enrollMutation.error.message}</AlertDescription>
              </Alert>
            )}
            {availableCoursesQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active courses are available right now.
              </p>
            )}
            {availableCoursesQuery.data && filteredAvailableCourses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No courses match your search.
              </p>
            )}
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {filteredAvailableCourses.map((course) => (
                <CatalogCourseRow
                  key={course.id}
                  course={course}
                  isEnrolling={enrollMutation.isPending}
                  onEnroll={() => enrollMutation.mutate(course.id)}
                />
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {enrolledCoursesQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading your courses...
        </Card>
      )}

      {enrolledCoursesQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{enrolledCoursesQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {enrolledCoursesQuery.data?.length === 0 && (
        <Card className="border-dashed p-10 text-center shadow-soft">
          <BookOpen className="mx-auto h-9 w-9 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">You are not enrolled in any courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse active courses and enroll to start asking the AI tutor.
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enrolledCoursesQuery.data?.map((course) => (
          <EnrolledCourseCard key={course.id} course={course} />
        ))}
      </div>
    </LearnerLayout>
  );
}

function CatalogCourseRow({
  course,
  isEnrolling,
  onEnroll,
}: {
  course: LearnerCourse;
  isEnrolling: boolean;
  onEnroll: () => void;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{course.title}</h3>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              Active
            </Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {course.subject} - {course.grade_level} with {course.teacher_name}
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {course.description}
          </p>
        </div>
        <Button
          size="sm"
          disabled={course.is_enrolled || isEnrolling}
          onClick={onEnroll}
          className={course.is_enrolled ? "" : "gradient-ai text-white"}
          variant={course.is_enrolled ? "outline" : "default"}
        >
          {course.is_enrolled ? "Enrolled" : isEnrolling ? "Enrolling..." : "Enroll"}
        </Button>
      </div>
    </div>
  );
}

function EnrolledCourseCard({ course }: { course: LearnerCourse }) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-soft transition hover:shadow-glow/40">
      <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight">{course.title}</h3>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            Enrolled
          </Badge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">with {course.teacher_name}</div>
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {course.resource_count} resources
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {course.student_count} students
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1 gradient-ai text-white shadow-glow" asChild>
            <Link to="/learner/courses/$courseId" params={{ courseId: String(course.id) }}>
              <MessageCircle className="h-4 w-4" /> Open Notebook
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/learner/resources">
              <Play className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
