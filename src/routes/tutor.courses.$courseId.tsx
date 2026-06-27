import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  ExternalLink,
  FileText,
  FolderOpen,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
  X,
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
  generateCourseWeaknessReports,
  getCourse,
  getCourseStudentProgress,
  listCourseResources,
  listCourseStudents,
  listCourseWeaknessReports,
  resolveFileUrl,
  updateCourse,
  updateCourseResource,
  uploadCourseResource,
  type Course,
  type CourseProgressStats,
  type CourseResource,
  type CourseStudent,
  type CourseStatus,
  type WeaknessReport,
} from "@/lib/api";

type CourseDetailSearch = {
  section?: CourseSectionId;
  studentId?: number;
};

export const Route = createFileRoute("/tutor/courses/$courseId")({
  validateSearch: (search: Record<string, unknown>): CourseDetailSearch => {
    const section = courseSections.some((item) => item.id === search.section)
      ? (search.section as CourseSectionId)
      : undefined;
    const rawStudentId = search.studentId;
    const studentId =
      typeof rawStudentId === "number"
        ? rawStudentId
        : typeof rawStudentId === "string"
          ? Number(rawStudentId)
          : undefined;

    return {
      section,
      studentId: Number.isFinite(studentId) ? studentId : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Course Workspace - AI Tutor" }] }),
  component: CourseDetailPage,
});

type CourseSectionId = "overview" | "resources" | "students";

const courseSections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "resources", label: "Resources / PDFs", icon: FolderOpen },
  { id: "students", label: "Students", icon: Users },
] as const satisfies ReadonlyArray<{
  id: CourseSectionId;
  label: string;
  icon: typeof BookOpen;
}>;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatScore(value: number | null) {
  return value === null ? "No attempts" : `${value}%`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function exportWeaknessReportAsPdf(
  report: WeaknessReport,
  progress?: Awaited<ReturnType<typeof getCourseStudentProgress>> | null,
) {
  const reportWindow = window.open("", "_blank", "width=900,height=700");
  if (!reportWindow) return;

  const statsRows = progress
    ? [
        ["Quizzes", String(progress.quiz_progress.quiz_count)],
        ["Attempts", String(progress.quiz_progress.attempt_count)],
        ["Best Score", formatScore(progress.quiz_progress.best_score)],
        ["Average", formatScore(progress.quiz_progress.average_score)],
        [
          "Correct Answers",
          `${progress.quiz_progress.correct_answer_count}/${progress.quiz_progress.answered_question_count}`,
        ],
        ["Student Messages", String(progress.learning_activity.chat_message_count)],
        ["Flashcards", String(progress.learning_activity.flashcard_card_count)],
        ["Latest Quiz", formatDateTime(progress.quiz_progress.latest_attempt_at)],
        ["Latest Chat", formatDateTime(progress.learning_activity.latest_chat_at)],
      ]
        .map(
          ([label, value]) => `
            <tr>
              <td>${escapeHtml(label)}</td>
              <td>${escapeHtml(value)}</td>
            </tr>
          `,
        )
        .join("")
    : "";

  const topicRows = report.weak_topics
    .map((topic) => {
      const selectedChoices =
        topic.selected_choices.length > 0
          ? topic.selected_choices
              .map((choice) => `${choice.key}${choice.text ? ` - ${choice.text}` : ""}`)
              .join(", ")
          : topic.selected_options.join(", ") || "Not answered";
      const correctChoice = `${topic.correct_option}${
        topic.correct_choice ? ` - ${topic.correct_choice}` : ""
      }`;
      return `
        <tr>
          <td>${escapeHtml(report.course_title)}</td>
          <td>${escapeHtml(topic.quiz_title)}</td>
          <td>${escapeHtml(topic.topic)}</td>
          <td>${escapeHtml(selectedChoices)}</td>
          <td>${escapeHtml(correctChoice)}</td>
          <td>${escapeHtml(topic.explanation || "")}</td>
        </tr>
      `;
    })
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Weakness Report - ${escapeHtml(report.student_name)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          h1 { font-size: 24px; margin: 0 0 4px; }
          h2 { font-size: 16px; margin: 28px 0 10px; }
          p { line-height: 1.5; }
          .meta { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
          .summary { border: 1px solid #d1d5db; border-radius: 8px; padding: 14px; background: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #eef2ff; }
          @media print { button { display: none; } body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Save as PDF</button>
        <h1>Weakness Report</h1>
        <div class="meta">${escapeHtml(report.student_name)} - ${escapeHtml(report.course_title)} - Generated ${escapeHtml(formatDateTime(report.generated_at))}</div>
        <div class="summary">${escapeHtml(report.weakness_summary)}</div>
        ${
          statsRows
            ? `
              <h2>Course-specific statistics</h2>
              <table>
                <tbody>${statsRows}</tbody>
              </table>
            `
            : ""
        }
        <h2>${escapeHtml(report.course_title)}</h2>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Quiz</th>
              <th>Question / Topic</th>
              <th>Selected Choice</th>
              <th>Correct Choice</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            ${
              topicRows ||
              `<tr><td colspan="6">No weak questions were detected for this report.</td></tr>`
            }
          </tbody>
        </table>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function CourseDetailPage() {
  const { courseId: courseIdParam } = Route.useParams();
  const search = Route.useSearch();
  const courseId = Number(courseIdParam);
  const [activeSection, setActiveSection] = useState<CourseSectionId>(
    search.section ?? "overview",
  );
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

  useEffect(() => {
    setActiveSection(search.section ?? "overview");
  }, [courseId, search.section]);

  return (
    <TutorLayout
      title={courseQuery.data?.title ?? "Course Workspace"}
      subtitle="Manage the course details and the PDFs learners use for AI chat, quizzes, and flashcards."
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

          {activeSection === "students" && (
            <StudentsSection courseId={courseId} initialStudentId={search.studentId} />
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
          <div className="flex flex-wrap gap-2 sm:col-span-4">
            <Button asChild size="sm" variant="outline">
              <Link to="/tutor/syllabus" search={{ courseId: course.id }}>
                <FileText className="h-4 w-4" /> Syllabus
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/tutor/digital-twin" search={{ courseId: course.id }}>
                <Brain className="h-4 w-4" /> Digital Twin
              </Link>
            </Button>
          </div>
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

function StudentsSection({
  courseId,
  initialStudentId,
}: {
  courseId: number;
  initialStudentId?: number;
}) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    initialStudentId ?? null,
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<WeaknessReport | null>(null);
  const queryClient = useQueryClient();
  const studentsQuery = useQuery({
    queryKey: ["courses", courseId, "students"],
    queryFn: () => listCourseStudents(courseId),
  });
  const reportsQuery = useQuery({
    queryKey: ["courses", courseId, "weakness-reports"],
    queryFn: () => listCourseWeaknessReports(courseId),
  });
  const selectedStudent =
    studentsQuery.data?.find((student) => student.id === selectedStudentId) ??
    studentsQuery.data?.[0];
  const selectedStudentIdForQuery = selectedStudent?.id ?? 0;
  const progressQuery = useQuery({
    queryKey: ["courses", courseId, "students", selectedStudentIdForQuery, "progress"],
    queryFn: () => getCourseStudentProgress(courseId, selectedStudentIdForQuery),
    enabled: selectedStudentIdForQuery > 0,
  });
  const generateWeaknessMutation = useMutation<WeaknessReport[], Error, number | undefined>({
    mutationFn: (studentId) => generateCourseWeaknessReports(courseId, studentId),
    onSuccess: async (reports) => {
      setActiveReport(reports[0] ?? null);
      await queryClient.invalidateQueries({
        queryKey: ["courses", courseId, "weakness-reports"],
      });
    },
  });
  const selectedReport = reportsQuery.data?.find(
    (report) => report.student_id === selectedStudent?.id,
  );

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [courseId, initialStudentId]);

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="h-fit shadow-soft">
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsQuery.isPending && (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          )}
          {studentsQuery.error && (
            <Alert variant="destructive">
              <AlertDescription>{studentsQuery.error.message}</AlertDescription>
            </Alert>
          )}
          {studentsQuery.data?.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No enrolled students</p>
              <p className="text-xs text-muted-foreground">
                Learners will appear here after enrolling in this course.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {studentsQuery.data?.map((student) => {
              const active = selectedStudent?.id === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition",
                    active
                      ? "border-primary/40 bg-primary/5 shadow-soft"
                      : "border-border hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {student.full_name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{student.full_name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {student.email || student.username}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {generateWeaknessMutation.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{generateWeaknessMutation.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-5">
        {!selectedStudent && !studentsQuery.isPending && (
          <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
            Select a student after learners enroll in this course.
          </Card>
        )}

        {selectedStudent && (
          <>
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" /> {selectedStudent.full_name}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enrolled {formatDateTime(selectedStudent.enrolled_at)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={generateWeaknessMutation.isPending}
                  onClick={() => {
                    setActiveReport(selectedReport ?? null);
                    setReportDialogOpen(true);
                    generateWeaknessMutation.mutate(selectedStudent.id);
                  }}
                >
                  <Brain className="h-4 w-4" />
                  {generateWeaknessMutation.isPending ? "Generating..." : "Generate Report"}
                </Button>
              </CardHeader>
              <CardContent>
                {progressQuery.isPending && (
                  <p className="text-sm text-muted-foreground">Loading progress...</p>
                )}
                {progressQuery.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{progressQuery.error.message}</AlertDescription>
                  </Alert>
                )}
                {progressQuery.data && <StudentProgressGrid progress={progressQuery.data} />}
              </CardContent>
            </Card>

            <WeaknessReportDialog
              open={reportDialogOpen}
              onOpenChange={setReportDialogOpen}
              report={activeReport}
              student={selectedStudent}
              progress={progressQuery.data ?? null}
              isGenerating={generateWeaknessMutation.isPending}
              error={generateWeaknessMutation.error ?? reportsQuery.error}
            />
          </>
        )}
      </div>
    </div>
  );
}

function StudentProgressGrid({
  progress,
}: {
  progress: Awaited<ReturnType<typeof getCourseStudentProgress>>;
}) {
  const [coursesDialogOpen, setCoursesDialogOpen] = useState(false);
  const quiz = progress.quiz_progress;
  const activity = progress.learning_activity;
  const stats = [
    { label: "Quizzes", value: String(quiz.quiz_count) },
    { label: "Attempts", value: String(quiz.attempt_count) },
    { label: "Best Score", value: formatScore(quiz.best_score) },
    { label: "Average", value: formatScore(quiz.average_score) },
    {
      label: "Courses",
      value: String(progress.teacher_course_progress.summary.course_count),
      onClick: () => setCoursesDialogOpen(true),
    },
    { label: "Chat Sessions", value: String(activity.chat_session_count) },
    { label: "Student Messages", value: String(activity.chat_message_count) },
    { label: "Flashcards", value: String(activity.flashcard_card_count) },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) =>
          stat.onClick ? (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              className="rounded-lg border bg-card px-3 py-3 text-left transition hover:border-primary/50 hover:bg-accent"
            >
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-lg font-bold">{stat.value}</div>
            </button>
          ) : (
            <div key={stat.label} className="rounded-lg border bg-card px-3 py-3">
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-lg font-bold">{stat.value}</div>
            </div>
          ),
        )}
        <div className="rounded-lg border bg-card px-3 py-3 sm:col-span-2">
          <div className="text-xs text-muted-foreground">Latest Quiz Attempt</div>
          <div className="mt-1 text-sm font-semibold">
            {formatDateTime(quiz.latest_attempt_at)}
          </div>
        </div>
        <div className="rounded-lg border bg-card px-3 py-3 sm:col-span-2">
          <div className="text-xs text-muted-foreground">Latest Chat</div>
          <div className="mt-1 text-sm font-semibold">{formatDateTime(activity.latest_chat_at)}</div>
        </div>
      </div>

      <CoursePerformanceDialog
        open={coursesDialogOpen}
        onOpenChange={setCoursesDialogOpen}
        progress={progress}
      />
    </>
  );
}

function CoursePerformanceDialog({
  open,
  onOpenChange,
  progress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Awaited<ReturnType<typeof getCourseStudentProgress>>;
}) {
  const [courseSearch, setCourseSearch] = useState("");
  const summary = progress.teacher_course_progress.summary;
  const courses = progress.teacher_course_progress.courses.filter((courseProgress) =>
    courseProgress.course.title.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Courses for {progress.student.full_name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile label="Courses" value={String(summary.course_count)} />
          <MetricTile label="Attempts" value={String(summary.attempt_count)} />
          <MetricTile label="Avg Score" value={formatScore(summary.weighted_average_score)} />
          <MetricTile label="Student Messages" value={String(summary.student_chat_message_count)} />
          <MetricTile label="Flashcards" value={String(summary.flashcard_card_count)} />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
            placeholder="Search courses"
            className="pl-9"
          />
        </div>

        <div className="space-y-3">
          {courses.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No courses match this search.
            </div>
          )}
          {courses.map((courseProgress) => (
            <CoursePerformanceRow
              key={courseProgress.course.id}
              courseProgress={courseProgress}
              currentCourseId={progress.course.id}
              studentId={progress.student.id}
              onNavigate={() => onOpenChange(false)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CoursePerformanceRow({
  courseProgress,
  currentCourseId,
  studentId,
  onNavigate,
}: {
  courseProgress: CourseProgressStats;
  currentCourseId: number;
  studentId: number;
  onNavigate: () => void;
}) {
  const quiz = courseProgress.quiz_progress;
  const activity = courseProgress.learning_activity;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{courseProgress.course.title}</h3>
            {courseProgress.course.id === currentCourseId && (
              <Badge variant="secondary">Current course</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Statistics shown per this specific course.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link
            to="/tutor/courses/$courseId"
            params={{ courseId: String(courseProgress.course.id) }}
            search={{ section: "students", studentId }}
            onClick={onNavigate}
          >
            <BarChart3 className="h-4 w-4" /> Open analytics
          </Link>
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Attempts" value={String(quiz.attempt_count)} />
        <MetricTile label="Best Score" value={formatScore(quiz.best_score)} />
        <MetricTile label="Average" value={formatScore(quiz.average_score)} />
        <MetricTile
          label="Correct Answers"
          value={`${quiz.correct_answer_count}/${quiz.answered_question_count}`}
        />
        <MetricTile label="Student Messages" value={String(activity.chat_message_count)} />
        <MetricTile label="Flashcards" value={String(activity.flashcard_card_count)} />
        <MetricTile label="Latest Quiz" value={formatDateTime(quiz.latest_attempt_at)} />
        <MetricTile label="Latest Chat" value={formatDateTime(activity.latest_chat_at)} />
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-bold">{value}</div>
    </div>
  );
}

function WeaknessReportDialog({
  open,
  onOpenChange,
  report,
  student,
  progress,
  isGenerating,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WeaknessReport | null;
  student: CourseStudent;
  progress: Awaited<ReturnType<typeof getCourseStudentProgress>> | null;
  isGenerating: boolean;
  error: Error | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Weakness Report
          </DialogTitle>
        </DialogHeader>

        {isGenerating && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Generating report for {student.full_name}...
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!isGenerating && !error && !report && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Brain className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No report available</p>
          </div>
        )}

        {report && <WeaknessReportPanel report={report} progress={progress} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            className="gradient-ai text-white"
            disabled={!report}
            onClick={() => {
              if (report) exportWeaknessReportAsPdf(report, progress);
            }}
          >
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WeaknessReportPanel({
  report,
  progress,
}: {
  report: WeaknessReport;
  progress: Awaited<ReturnType<typeof getCourseStudentProgress>> | null;
}) {
  const courseGroups = [
    {
      courseTitle: report.course_title,
      topics: report.weak_topics,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{report.student_name}</p>
            <p className="text-xs text-muted-foreground">
              {report.course_title} - Generated {formatDateTime(report.generated_at)}
            </p>
          </div>
          <Badge variant="secondary">
            {report.weak_topics.length} weak question{report.weak_topics.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-6">{report.weakness_summary}</p>
      </div>

      {progress && (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-bold">Course-specific statistics</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              These numbers are for {progress.course.title} only.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile label="Quizzes" value={String(progress.quiz_progress.quiz_count)} />
            <MetricTile label="Attempts" value={String(progress.quiz_progress.attempt_count)} />
            <MetricTile label="Best Score" value={formatScore(progress.quiz_progress.best_score)} />
            <MetricTile label="Average" value={formatScore(progress.quiz_progress.average_score)} />
            <MetricTile
              label="Correct Answers"
              value={`${progress.quiz_progress.correct_answer_count}/${progress.quiz_progress.answered_question_count}`}
            />
            <MetricTile
              label="Student Messages"
              value={String(progress.learning_activity.chat_message_count)}
            />
            <MetricTile
              label="Flashcards"
              value={String(progress.learning_activity.flashcard_card_count)}
            />
            <MetricTile
              label="Latest Quiz"
              value={formatDateTime(progress.quiz_progress.latest_attempt_at)}
            />
            <MetricTile
              label="Latest Chat"
              value={formatDateTime(progress.learning_activity.latest_chat_at)}
            />
          </div>
        </div>
      )}

      {report.weak_topics.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Brain className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No weak questions detected</p>
        </div>
      )}

      {courseGroups.map(({ courseTitle, topics }) => (
        <div key={courseTitle} className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">{courseTitle}</h3>
          </div>
          {topics.map((topic) => {
            const selectedChoices =
              topic.selected_choices.length > 0
                ? topic.selected_choices
                : topic.selected_options.map((option) => ({ key: option, text: "" }));
            return (
              <div key={topic.question_id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{topic.quiz_title}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    Missed {topic.miss_count} time{topic.miss_count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    Question / Topic
                  </div>
                  <h4 className="text-sm font-semibold">{topic.topic}</h4>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-950">
                    <div className="text-xs font-semibold text-red-700">
                      Selected Choice
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {selectedChoices.length > 0
                        ? selectedChoices
                            .map((choice) =>
                              choice.text ? `${choice.key} - ${choice.text}` : choice.key,
                            )
                            .join(", ")
                        : "Not answered"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                    <div className="text-xs font-semibold text-emerald-700">
                      Correct Choice
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {topic.correct_option}
                      {topic.correct_choice ? ` - ${topic.correct_choice}` : ""}
                    </div>
                  </div>
                </div>
                {topic.explanation && (
                  <p className="mt-3 text-sm text-muted-foreground">{topic.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function clearSelectedFile() {
    setSelectedFile(null);
    uploadMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
                clearSelectedFile();
              } catch {
                // React Query exposes the upload error below.
              }
            }}
          >
            <div className={selectedFile ? "hidden" : "space-y-1.5"}>
              <Label htmlFor="resource-file">Course resource</Label>
              <Input
                id="resource-file"
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">PDF only, up to 10 MB.</p>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{selectedFile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
                <Button
                  type="reset"
                  size="sm"
                  variant="outline"
                  disabled={uploadMutation.isPending}
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            )}
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
