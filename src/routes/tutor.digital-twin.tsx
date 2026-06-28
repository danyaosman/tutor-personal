import { useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  FileText,
  LoaderCircle,
  Pencil,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  createTeachingStyleExample,
  deleteCourseResource,
  deleteTeachingStyleExample,
  getProfile,
  listCourses,
  listCourseResources,
  listTeachingStyleExamples,
  uploadCourseResource,
  updateTeachingStyleExample,
  type Course,
  type CourseResource,
  type TeachingStyleExample,
} from "@/lib/api";
import { translateUiText } from "@/lib/edumindUi";

type DigitalTwinSearch = {
  courseId?: number;
};

export const Route = createFileRoute("/tutor/digital-twin")({
  validateSearch: (search: Record<string, unknown>): DigitalTwinSearch => {
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
  head: () => ({ meta: [{ title: "Digital Twin - AI Tutor" }] }),
  component: TutorDigitalTwinPage,
});

function TutorDigitalTwinPage() {
  const search = Route.useSearch();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    search.courseId ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [examplesDialogOpen, setExamplesDialogOpen] = useState(false);
  const [resourcesDialogOpen, setResourcesDialogOpen] = useState(false);
  const [exampleSearch, setExampleSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: getProfile,
  });
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });
  const selectedCourse = coursesQuery.data?.find((course) => course.id === selectedCourseId);
  const examplesQuery = useQuery({
    queryKey: ["courses", selectedCourseId, "teaching-style-examples"],
    queryFn: () => listTeachingStyleExamples(selectedCourseId ?? 0),
    enabled: selectedCourseId !== null,
  });
  const resourcesQuery = useQuery({
    queryKey: ["courses", selectedCourseId, "resources"],
    queryFn: () => listCourseResources(selectedCourseId ?? 0),
    enabled: selectedCourseId !== null,
  });
  const styleResources =
    resourcesQuery.data?.filter((resource) => resource.is_style_example) ?? [];
  const typedExamples = examplesQuery.data ?? [];
  const visibleExample = typedExamples[0];
  const visibleStyleResource = styleResources[0];
  const filteredExamples = typedExamples.filter((example) =>
    example.example_text.toLowerCase().includes(exampleSearch.trim().toLowerCase()),
  );
  const filteredResources = styleResources.filter((resource) =>
    resource.file_name.toLowerCase().includes(resourceSearch.trim().toLowerCase()),
  );
  async function invalidateStyleData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["courses", selectedCourseId, "teaching-style-examples"],
      }),
      queryClient.invalidateQueries({ queryKey: ["courses", selectedCourseId, "resources"] }),
    ]);
  }
  const saveStyleMutation = useMutation({
    mutationFn: async (input: { exampleText: string; file: File | null }) => {
      const exampleText = input.exampleText.trim();
      if (exampleText) {
        await createTeachingStyleExample(selectedCourseId ?? 0, {
          example_text: exampleText,
        });
      }

      if (input.file) {
        const fileName = input.file.name.toLowerCase();
        if (fileName.endsWith(".txt") || input.file.type === "text/plain") {
          const fileText = (await input.file.text()).trim();
          if (!fileText) throw new Error("The selected text file is empty.");
          await createTeachingStyleExample(selectedCourseId ?? 0, {
            example_text: fileText,
          });
        } else if (fileName.endsWith(".pdf") || input.file.type === "application/pdf") {
          await uploadCourseResource(selectedCourseId ?? 0, input.file, {
            is_style_example: true,
          });
        } else {
          throw new Error("Upload a PDF or TXT file for teaching style references.");
        }
      }
    },
    onSuccess: invalidateStyleData,
  });
  const updateExampleMutation = useMutation({
    mutationFn: (input: { exampleId: number; exampleText: string }) =>
      updateTeachingStyleExample(selectedCourseId ?? 0, input.exampleId, {
        example_text: input.exampleText,
      }),
    onSuccess: invalidateStyleData,
  });
  const deleteExampleMutation = useMutation({
    mutationFn: (exampleId: number) => deleteTeachingStyleExample(selectedCourseId ?? 0, exampleId),
    onSuccess: invalidateStyleData,
  });
  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: number) => deleteCourseResource(selectedCourseId ?? 0, resourceId),
    onSuccess: invalidateStyleData,
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

  return (
    <TutorLayout
      title="Digital Twin"
      subtitle="Shape how the AI tutor explains your course material to learners."
      actions={
        <Button asChild variant="outline">
          <Link to="/tutor/settings">
            <Settings className="h-4 w-4" /> Profile Settings
          </Link>
        </Button>
      }
    >
      {(profileQuery.error || coursesQuery.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {profileQuery.error?.message ?? coursesQuery.error?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Twin Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileQuery.isPending && (
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              )}
              {profileQuery.data && (
                <>
                  <ProfileBlock
                    label="Teaching Style"
                    value={profileQuery.data.teaching_style_summary}
                  />
                  <ProfileBlock label="AI Instructions" value={profileQuery.data.ai_instructions} />
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to="/tutor/settings">Edit Profile Guidance</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesQuery.isPending && (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              )}
              {coursesQuery.data?.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Brain className="mx-auto h-8 w-8 text-muted-foreground" />
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
                      saveStyleMutation.reset();
                      setSelectedFile(null);
                      setFormMessage(null);
                      setExampleSearch("");
                      setResourceSearch("");
                      setExamplesDialogOpen(false);
                      setResourcesDialogOpen(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
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
                <div className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{selectedCourse.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedCourse.subject} - {selectedCourse.grade_level}
                      </p>
                    </div>
                    <Badge variant="secondary">{selectedCourse.status}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Add Teaching Style Example</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const formElement = event.currentTarget;
                  const form = new FormData(formElement);
                  const exampleText = String(form.get("example_text") ?? "");
                  if (!exampleText.trim() && !selectedFile) {
                    setFormMessage("Write an example or upload a PDF/TXT style reference.");
                    return;
                  }
                  setFormMessage(null);
                  try {
                    await saveStyleMutation.mutateAsync({
                      exampleText,
                      file: selectedFile,
                    });
                    formElement.reset();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  } catch {
                    // React Query exposes the request error below.
                  }
                }}
              >
                {(saveStyleMutation.error || formMessage) && (
                  <Alert variant="destructive">
                    <AlertDescription>{formMessage ?? saveStyleMutation.error?.message}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="example_text">Example</Label>
                  <Textarea
                    id="example_text"
                    name="example_text"
                    rows={7}
                    placeholder="Paste or write an explanation that sounds like your teaching style"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="style-file">Style file</Label>
                  <Input
                    id="style-file"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf,text/plain,.txt"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] ?? null);
                      setFormMessage(null);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    TXT files become teaching examples. PDFs are processed as style references for
                    the AI tutor.
                  </p>
                </div>
                {selectedFile && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedFile.type || "Selected file"}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saveStyleMutation.isPending}
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                )}
                <Button
                  type="submit"
                  className="gradient-ai text-white"
                  disabled={!selectedCourseId || saveStyleMutation.isPending}
                >
                  {saveStyleMutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  Save Style Input
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Typed Style Examples</CardTitle>
                {typedExamples.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setExamplesDialogOpen(true)}
                  >
                    View more
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {examplesQuery.isPending && selectedCourseId && (
                <p className="text-sm text-muted-foreground">Loading examples...</p>
              )}
              {(examplesQuery.error || updateExampleMutation.error || deleteExampleMutation.error) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {examplesQuery.error?.message ??
                      updateExampleMutation.error?.message ??
                      deleteExampleMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}
              {!selectedCourseId && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Select a course to view teaching style examples.
                </div>
              )}
              {selectedCourseId && examplesQuery.data?.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No examples yet</p>
                </div>
              )}
              {visibleExample && (
                <TeachingStyleExampleRow
                  example={visibleExample}
                  updateExampleMutation={updateExampleMutation}
                  deleteExampleMutation={deleteExampleMutation}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Uploaded Style Files</CardTitle>
                {styleResources.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setResourcesDialogOpen(true)}
                  >
                    View more
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {resourcesQuery.isPending && selectedCourseId && (
                <p className="text-sm text-muted-foreground">Loading style files...</p>
              )}
              {(resourcesQuery.error || deleteResourceMutation.error) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {resourcesQuery.error?.message ?? deleteResourceMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}
              {selectedCourseId && !resourcesQuery.isPending && styleResources.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No style files uploaded</p>
                </div>
              )}
              {visibleStyleResource && (
                <StyleResourceRow
                  resource={visibleStyleResource}
                  deleteResourceMutation={deleteResourceMutation}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={examplesDialogOpen} onOpenChange={setExamplesDialogOpen}>
        <DialogContent className="max-h-[86vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Typed Style Examples</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={exampleSearch}
                onChange={(event) => setExampleSearch(event.target.value)}
                placeholder="Search examples"
              />
            </div>
            {filteredExamples.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No examples match your search.
              </div>
            )}
            <div className="space-y-3">
              {filteredExamples.map((example) => (
                <TeachingStyleExampleRow
                  key={example.id}
                  example={example}
                  updateExampleMutation={updateExampleMutation}
                  deleteExampleMutation={deleteExampleMutation}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resourcesDialogOpen} onOpenChange={setResourcesDialogOpen}>
        <DialogContent className="max-h-[86vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uploaded Style Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={resourceSearch}
                onChange={(event) => setResourceSearch(event.target.value)}
                placeholder="Search files"
              />
            </div>
            {filteredResources.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No style files match your search.
              </div>
            )}
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <StyleResourceRow
                  key={resource.id}
                  resource={resource}
                  deleteResourceMutation={deleteResourceMutation}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TutorLayout>
  );
}

function ProfileBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
        {value?.trim() || "Not configured yet."}
      </p>
    </div>
  );
}

function TeachingStyleExampleRow({
  example,
  updateExampleMutation,
  deleteExampleMutation,
}: {
  example: TeachingStyleExample;
  updateExampleMutation: UseMutationResult<
    TeachingStyleExample,
    Error,
    { exampleId: number; exampleText: string }
  >;
  deleteExampleMutation: UseMutationResult<void, Error, number>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(example.example_text);
  const trimmedDraft = draftText.trim();

  useEffect(() => {
    setDraftText(example.example_text);
  }, [example.example_text]);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">{example.course_title}</Badge>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsEditing((current) => !current)}
          >
            <Pencil className="h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={deleteExampleMutation.isPending}
            onClick={() => {
              if (window.confirm(translateUiText("Delete this teaching style example?"))) {
                deleteExampleMutation.mutate(example.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      {isEditing ? (
        <div className="mt-3 space-y-3">
          <Textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            className="min-h-[180px] text-sm leading-6"
          />
          <Button
            type="button"
            className="gradient-ai text-white"
            disabled={
              updateExampleMutation.isPending ||
              !trimmedDraft ||
              trimmedDraft === example.example_text
            }
            onClick={async () => {
              try {
                await updateExampleMutation.mutateAsync({
                  exampleId: example.id,
                  exampleText: trimmedDraft,
                });
                setIsEditing(false);
              } catch {
                // React Query exposes the request error above the list.
              }
            }}
          >
            {updateExampleMutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      ) : (
        <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm leading-6">
          {example.example_text}
        </p>
      )}
    </div>
  );
}

function StyleResourceRow({
  resource,
  deleteResourceMutation,
}: {
  resource: CourseResource;
  deleteResourceMutation: UseMutationResult<void, Error, number>;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{resource.file_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Completed PDF files are fed into the AI tutor as teaching style references.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{resource.processing_status}</Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={deleteResourceMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  translateUiText(`Delete "${resource.file_name}" from style files?`),
                )
              ) {
                deleteResourceMutation.mutate(resource.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
