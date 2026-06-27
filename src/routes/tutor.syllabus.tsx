import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, LoaderCircle, Save, Sparkles, UploadCloud, X } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  generateCourseSyllabus,
  getCourseSyllabus,
  listCourseResources,
  listCourses,
  updateCourseSyllabus,
  uploadCourseResource,
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
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(search.courseId ?? null);
  const [draftContent, setDraftContent] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const resourcesQuery = useQuery({
    queryKey: ["courses", selectedCourseId, "resources"],
    queryFn: () => listCourseResources(selectedCourseId ?? 0),
    enabled: selectedCourseId !== null,
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCourseResource(selectedCourseId ?? 0, file),
    onSuccess: async () => {
      setSelectedFile(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
        queryClient.invalidateQueries({ queryKey: ["courses", selectedCourseId, "resources"] }),
      ]);
    },
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
                    setSelectedFile(null);
                    saveMutation.reset();
                    generateMutation.reset();
                    uploadMutation.reset();
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
                  <div className="text-sm font-semibold">Grade {selectedCourse.grade_level}</div>
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
            {(syllabusQuery.error ||
              resourcesQuery.error ||
              uploadMutation.error ||
              saveMutation.error ||
              generateMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {syllabusQuery.error?.message ??
                    resourcesQuery.error?.message ??
                    uploadMutation.error?.message ??
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
                  <Label htmlFor="syllabus-source-text">Source text or instructions</Label>
                  <Textarea
                    id="syllabus-source-text"
                    rows={6}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Paste curriculum notes, weekly goals, unit outlines, or instructions for the generated syllabus."
                  />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Label>PDF sources</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload course PDFs here, then generate a syllabus from the extracted text.
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {resourcesQuery.data?.length ?? 0} tutor source
                      {(resourcesQuery.data?.length ?? 0) === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <form
                    className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (!selectedFile) return;
                      try {
                        await uploadMutation.mutateAsync(selectedFile);
                        event.currentTarget.reset();
                      } catch {
                        // React Query exposes the upload error above.
                      }
                    }}
                  >
                    <Input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={uploadMutation.isPending}
                      onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    />
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadMutation.isPending}
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" /> Clear
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="gradient-ai text-white"
                      disabled={!selectedFile || uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      {uploadMutation.isPending ? "Uploading..." : "Upload PDF"}
                    </Button>
                  </form>
                  {resourcesQuery.data && resourcesQuery.data.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {resourcesQuery.data.slice(0, 6).map((resource) => (
                        <div
                          key={resource.id}
                          className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{resource.file_name}</span>
                          <Badge variant="secondary" className="ml-auto capitalize">
                            {resource.processing_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="syllabus-content">Generated syllabus draft</Label>
                  <Textarea
                    id="syllabus-content"
                    className="min-h-[520px] font-mono text-sm leading-6"
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    placeholder="Generate from pasted text and uploaded PDFs, then make final edits here."
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
