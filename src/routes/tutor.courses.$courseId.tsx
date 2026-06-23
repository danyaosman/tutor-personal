import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, UploadCloud } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCourse, listCourseResources, uploadCourseResource } from "@/lib/api";

export const Route = createFileRoute("/tutor/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course Setup - AI Tutor" }] }),
  component: CourseDetailPage,
});

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CourseDetailPage() {
  const { courseId: courseIdParam } = Route.useParams();
  const courseId = Number(courseIdParam);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const courseQuery = useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => getCourse(courseId),
  });
  const resourcesQuery = useQuery({
    queryKey: ["courses", courseId, "resources"],
    queryFn: () => listCourseResources(courseId),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCourseResource(courseId, file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
        queryClient.invalidateQueries({ queryKey: ["courses", courseId, "resources"] }),
      ]);
    },
  });

  return (
    <TutorLayout
      title={courseQuery.data?.title ?? "Course Setup"}
      subtitle="Manage the course information and the resources used by your Digital Twin."
      actions={
        <Button asChild variant="outline">
          <Link to="/tutor/courses">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </Button>
      }
    >
      {courseQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{courseQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {courseQuery.data && (
        <Card className="shadow-soft">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="font-semibold">{courseQuery.data.subject}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Grade</div>
              <div className="font-semibold">{courseQuery.data.grade_level}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge variant="secondary" className="mt-1 capitalize">
                {courseQuery.data.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground sm:col-span-3">
              {courseQuery.data.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit shadow-soft">
          <CardHeader>
            <CardTitle>Upload a PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!selectedFile) return;
                const formElement = event.currentTarget;
                try {
                  await uploadMutation.mutateAsync(selectedFile);
                  formElement.reset();
                  setSelectedFile(null);
                } catch {
                  // React Query exposes the upload error below.
                }
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="resource-file">Course resource</Label>
                <Input
                  id="resource-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">PDF only, up to 10 MB.</p>
              </div>
              {uploadMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadMutation.error.message}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full gradient-ai text-white"
              >
                <UploadCloud className="h-4 w-4" />
                {uploadMutation.isPending ? "Uploading..." : "Upload PDF"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Course Resources</CardTitle>
          </CardHeader>
          <CardContent>
            {resourcesQuery.isPending && (
              <p className="text-sm text-muted-foreground">Loading resources...</p>
            )}
            {resourcesQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>{resourcesQuery.error.message}</AlertDescription>
              </Alert>
            )}
            {resourcesQuery.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No resources uploaded</p>
                <p className="text-xs text-muted-foreground">
                  Upload the first PDF for this course.
                </p>
              </div>
            )}
            <div className="space-y-3">
              {resourcesQuery.data?.map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{resource.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(resource.file_size)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {resource.processing_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
