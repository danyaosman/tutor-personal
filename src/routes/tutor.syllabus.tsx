import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, LoaderCircle, Save, Sparkles } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateCourseSyllabus,
  getCourseSyllabus,
  listCourses,
  updateCourseSyllabus,
  type Course,
} from "@/lib/api";

type SyllabusSearch = {
  courseId?: number;
};

export const Route = createFileRoute("/tutor/syllabus")({
  validateSearch: (search: Record<string, unknown>): SyllabusSearch => {
    const rawCourseId = search.courseId;
    const courseId =
      typeof rawCourseId === "number"
        ? rawCourseId
        : typeof rawCourseId === "string"
          ? Number(rawCourseId)
          : undefined;
    return {
      courseId: Number.isFinite(courseId) ? courseId : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Syllabus - AI Tutor" }] }),
  component: TutorSyllabusPage,
});

function formatDateTime(value?: string | null) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function TutorSyllabusPage() {
  const search = Route.useSearch();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    search.courseId ?? null,
  );
  const [draftContent, setDraftContent] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });
  const selectedCourse = coursesQuery.data?.find((course) => course.id === selectedCourseId);
  const syllabusQuery = useQuery({
    queryKey: ["courses", selectedCourseId, "syllabus"],
    queryFn: () => getCourseSyllabus(selectedCourseId ?? 0),
    enabled: selectedCourseId !== null,
  });
  const saveMutation = useMutation({
    mutationFn: () => updateCourseSyllabus(selectedCourseId ?? 0, draftContent),
    onSuccess: async (syllabus) => {
      queryClient.setQueryData(["courses", selectedCourseId, "syllabus"], syllabus);
      setDraftContent(syllabus.content);
    },
  });
  const generateMutation = useMutation({
    mutationFn: () => generateCourseSyllabus(selectedCourseId ?? 0, notes),
    onSuccess: async (syllabus) => {
      queryClient.setQueryData(["courses", selectedCourseId, "syllabus"], syllabus);
      setDraftContent(syllabus.content);
    },
  });

  useEffect(() => {
    if (search.courseId) {
      setSelectedCourseId(search.courseId);
      return;
    }
    if (!selectedCourseId && coursesQuery.data?.length) {
      setSelectedCourseId(coursesQuery.data[0].id);
    }
  }, [coursesQuery.data, search.courseId, selectedCourseId]);

  useEffect(() => {
    if (syllabusQuery.data) {
      setDraftContent(syllabusQuery.data.content);
    }
  }, [syllabusQuery.data]);

  return (
    <TutorLayout
      title="Syllabus"
      subtitle="Generate and refine course plans from your course details and uploaded resources."
    >
      {coursesQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{coursesQuery.error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesQuery.isPending && (
              <p className="text-sm text-muted-foreground">Loading courses...</p>
            )}
            {coursesQuery.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No courses yet</p>
                <Button asChild className="mt-4 gradient-ai text-white">
                  <Link to="/tutor/courses">Create Course</Link>
                </Button>
              </div>
            )}
            {(coursesQuery.data?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select
                  value={selectedCourseId ? String(selectedCourseId) : ""}
                  onValueChange={(value) => {
                    setSelectedCourseId(Number(value));
                    saveMutation.reset();
                    generateMutation.reset();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesQuery.data?.map((course: Course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCourse && (
              <div className="space-y-3 rounded-lg border p-3">
                <div>
                  <div className="text-xs text-muted-foreground">Subject</div>
                  <div className="text-sm font-semibold">{selectedCourse.subject}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Grade</div>
                  <div className="text-sm font-semibold">{selectedCourse.grade_level}</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="secondary">{selectedCourse.status}</Badge>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link
                    to="/tutor/courses/$courseId"
                    params={{ courseId: String(selectedCourse.id) }}
                  >
                    Open Course
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Syllabus Draft</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {formatDateTime(syllabusQuery.data?.updated_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedCourseId || generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                >
                  {generateMutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate
                </Button>
                <Button
                  type="button"
                  className="gradient-ai text-white"
                  disabled={!selectedCourseId || !draftContent.trim() || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(syllabusQuery.error || saveMutation.error || generateMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {syllabusQuery.error?.message ??
                    saveMutation.error?.message ??
                    generateMutation.error?.message}
                </AlertDescription>
              </Alert>
            )}
            {syllabusQuery.isPending && selectedCourseId && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Loading syllabus...
              </div>
            )}
            {!selectedCourseId && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Select a course to manage its syllabus.
              </div>
            )}
            {selectedCourseId && !syllabusQuery.isPending && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="syllabus-notes">Generation notes</Label>
                  <Textarea
                    id="syllabus-notes"
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional focus areas for the generated syllabus"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="syllabus-content">Content</Label>
                  <Textarea
                    id="syllabus-content"
                    className="min-h-[520px] font-mono text-sm leading-6"
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    placeholder="Generate or write a syllabus for this course"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
