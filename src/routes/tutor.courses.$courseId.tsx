import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderOpen,
  HelpCircle,
  Inbox,
  Pencil,
  Target,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  deleteCourseResource,
  getCourse,
  listCourseResources,
  resolveFileUrl,
  updateCourse,
  updateCourseResource,
  uploadCourseResource,
  type Course,
  type CourseResource,
  type CourseStatus,
} from "@/lib/api";

export const Route = createFileRoute("/tutor/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course Workspace - AI Tutor" }] }),
  component: CourseDetailPage,
});

type CourseSectionId =
  | "overview"
  | "resources"
  | "syllabus"
  | "quizzes"
  | "assignments"
  | "classes"
  | "analytics"
  | "weakness"
  | "requests";

const courseSections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "resources", label: "Resources / PDFs", icon: FolderOpen },
  { id: "syllabus", label: "Syllabus & Goals", icon: Target },
  { id: "quizzes", label: "Quizzes", icon: HelpCircle },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "classes", label: "Classes & Students", icon: Users },
  { id: "analytics", label: "Student Analytics", icon: BarChart3 },
  { id: "weakness", label: "Weakness Analysis", icon: AlertTriangle },
  { id: "requests", label: "Requests", icon: Inbox },
] as const satisfies ReadonlyArray<{
  id: CourseSectionId;
  label: string;
  icon: typeof BookOpen;
}>;

const sectionCopy: Record<
  Exclude<CourseSectionId, "overview" | "resources">,
  { title: string; description: string; items: string[] }
> = {
  syllabus: {
    title: "Syllabus & Goals",
    description:
      "This area should let the tutor define what the course covers and what learners should achieve.",
    items: ["Course goals", "Weekly topics", "Tutor-edited syllabus summary"],
  },
  quizzes: {
    title: "Quizzes",
    description:
      "This area should let the tutor create or review quizzes connected to this specific course.",
    items: ["Generated quizzes", "Manual quiz editing", "Quiz results per learner"],
  },
  assignments: {
    title: "Assignments",
    description: "This area should keep course assignments separate from other courses.",
    items: ["Assignment list", "Submission overview", "Due dates"],
  },
  classes: {
    title: "Classes & Students",
    description:
      "This area should show the classes opened under this course and the learners inside them.",
    items: ["Class groups", "Enrolled students", "Invite or connection requests"],
  },
  analytics: {
    title: "Student Analytics",
    description: "This area should summarize course-level student performance for the tutor.",
    items: ["Quiz averages", "Assignment progress", "Engagement overview"],
  },
  weakness: {
    title: "Weakness Analysis",
    description:
      "This area should show what learners are struggling with after quizzes and assignments.",
    items: ["Weak topics", "Students needing support", "Suggested review material"],
  },
  requests: {
    title: "Requests",
    description: "This area should collect learner requests related to this course.",
    items: ["Join requests", "Tutor connection requests", "Course help requests"],
  },
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CourseDetailPage() {
  const { courseId: courseIdParam } = Route.useParams();
  const courseId = Number(courseIdParam);
  const [activeSection, setActiveSection] = useState<CourseSectionId>("overview");
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
  const updateResourceMutation = useMutation<
    CourseResource,
    Error,
    { resourceId: number; file_name: string; is_style_example: boolean }
  >({
    mutationFn: ({ resourceId, file_name, is_style_example }) =>
      updateCourseResource(courseId, resourceId, { file_name, is_style_example }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["courses", courseId, "resources"] });
    },
  });
  const deleteResourceMutation = useMutation<void, Error, number>({
    mutationFn: (resourceId) => deleteCourseResource(courseId, resourceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
        queryClient.invalidateQueries({ queryKey: ["courses", courseId, "resources"] }),
      ]);
    },
  });
  const updateStatusMutation = useMutation<Course, Error, CourseStatus>({
    mutationFn: (status) => updateCourse(courseId, { status }),
    onSuccess: async (updatedCourse) => {
      queryClient.setQueryData(["courses", courseId], updatedCourse);
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return (
    <TutorLayout
      title={courseQuery.data?.title ?? "Course Workspace"}
      subtitle="Open a course first, then manage its resources, quizzes, students, and analysis from one place."
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

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Course Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {courseSections.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className={["h-4 w-4", active ? "text-primary" : ""].join(" ")} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="min-w-0">
          {activeSection === "overview" && (
            <CourseOverview
              isLoading={courseQuery.isPending}
              course={courseQuery.data}
              resourceCount={resourcesQuery.data?.length ?? courseQuery.data?.resource_count ?? 0}
              updateStatusMutation={updateStatusMutation}
            />
          )}

          {activeSection === "resources" && (
            <ResourcesSection
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              uploadMutation={uploadMutation}
              updateResourceMutation={updateResourceMutation}
              deleteResourceMutation={deleteResourceMutation}
              resourcesQuery={resourcesQuery}
            />
          )}

          {activeSection !== "overview" && activeSection !== "resources" && (
            <CoursePlaceholderSection {...sectionCopy[activeSection]} />
          )}
        </div>
      </div>
    </TutorLayout>
  );
}

function CourseOverview({
  isLoading,
  course,
  resourceCount,
  updateStatusMutation,
}: {
  isLoading: boolean;
  course?: Awaited<ReturnType<typeof getCourse>>;
  resourceCount: number;
  updateStatusMutation: ReturnType<typeof useMutation<Course, Error, CourseStatus>>;
}) {
  if (isLoading) {
    return (
      <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
        Loading course...
      </Card>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-5">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Subject</div>
            <div className="font-semibold">{course.subject}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Grade</div>
            <div className="font-semibold">{course.grade_level}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Resources</div>
            <div className="font-semibold">{resourceCount}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <Select
              value={course.status}
              onValueChange={(value) => updateStatusMutation.mutate(value as CourseStatus)}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-4">{course.description}</p>
          {updateStatusMutation.error && (
            <Alert variant="destructive" className="sm:col-span-4">
              <AlertDescription>{updateStatusMutation.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResourcesSection({
  selectedFile,
  setSelectedFile,
  uploadMutation,
  updateResourceMutation,
  deleteResourceMutation,
  resourcesQuery,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploadMutation: ReturnType<typeof useMutation<unknown, Error, File>>;
  updateResourceMutation: ReturnType<
    typeof useMutation<
      CourseResource,
      Error,
      { resourceId: number; file_name: string; is_style_example: boolean }
    >
  >;
  deleteResourceMutation: ReturnType<typeof useMutation<void, Error, number>>;
  resourcesQuery: ReturnType<typeof useQuery<Awaited<ReturnType<typeof listCourseResources>>>>;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
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
              <p className="text-xs text-muted-foreground">Upload the first PDF for this course.</p>
            </div>
          )}
          <div className="space-y-3">
            {resourcesQuery.data?.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                updateResourceMutation={updateResourceMutation}
                deleteResourceMutation={deleteResourceMutation}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceRow({
  resource,
  updateResourceMutation,
  deleteResourceMutation,
}: {
  resource: CourseResource;
  updateResourceMutation: ReturnType<
    typeof useMutation<
      CourseResource,
      Error,
      { resourceId: number; file_name: string; is_style_example: boolean }
    >
  >;
  deleteResourceMutation: ReturnType<typeof useMutation<void, Error, number>>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{resource.file_name}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(resource.file_size)}</span>
            {resource.is_style_example && <span>Style example</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Badge variant="secondary" className="capitalize">
          {resource.processing_status}
        </Badge>
        <Button asChild size="sm" variant="outline">
          <a href={resolveFileUrl(resource.file)} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> Open
          </a>
        </Button>
        <EditResourceDialog
          resource={resource}
          updateResourceMutation={updateResourceMutation}
        />
        <DeleteResourceDialog
          resource={resource}
          deleteResourceMutation={deleteResourceMutation}
        />
      </div>
    </div>
  );
}

function EditResourceDialog({
  resource,
  updateResourceMutation,
}: {
  resource: CourseResource;
  updateResourceMutation: ReturnType<
    typeof useMutation<
      CourseResource,
      Error,
      { resourceId: number; file_name: string; is_style_example: boolean }
    >
  >;
}) {
  const [open, setOpen] = useState(false);
  const [isStyleExample, setIsStyleExample] = useState(resource.is_style_example);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setIsStyleExample(resource.is_style_example);
          updateResourceMutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit resource</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await updateResourceMutation.mutateAsync({
                resourceId: resource.id,
                file_name: String(form.get("file_name")),
                is_style_example: isStyleExample,
              });
              setOpen(false);
            } catch {
              // React Query exposes the update error below.
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={`resource-name-${resource.id}`}>Display name</Label>
            <Input
              id={`resource-name-${resource.id}`}
              name="file_name"
              defaultValue={resource.file_name}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Resource role</Label>
            <Select
              value={isStyleExample ? "true" : "false"}
              onValueChange={(value) => setIsStyleExample(value === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Course content</SelectItem>
                <SelectItem value="true">Tutor style example</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Style examples can later help the AI match the tutor&apos;s teaching style.
            </p>
          </div>
          {updateResourceMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>{updateResourceMutation.error.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateResourceMutation.isPending}
              className="gradient-ai text-white"
            >
              {updateResourceMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteResourceDialog({
  resource,
  deleteResourceMutation,
}: {
  resource: CourseResource;
  deleteResourceMutation: ReturnType<typeof useMutation<void, Error, number>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) deleteResourceMutation.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes &quot;{resource.file_name}&quot; from the course resources. You can upload
            it again later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteResourceMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>{deleteResourceMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteResourceMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteResourceMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async (event) => {
              event.preventDefault();
              try {
                await deleteResourceMutation.mutateAsync(resource.id);
                setOpen(false);
              } catch {
                // React Query exposes the delete error above.
              }
            }}
          >
            {deleteResourceMutation.isPending ? "Deleting..." : "Delete Resource"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CoursePlaceholderSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-lg border border-dashed bg-secondary/30 p-4">
              <div className="text-sm font-semibold">{item}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Course-specific UI area ready for backend wiring.
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
