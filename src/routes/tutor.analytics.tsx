import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, FileText, HelpCircle, MessageSquare, Users } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getQuizAttempt,
  getTutorAnalyticsOverview,
  getWeaknessReport,
  type QuizAttemptResult,
  type WeaknessReport,
} from "@/lib/api";

export const Route = createFileRoute("/tutor/analytics")({
  head: () => ({ meta: [{ title: "Analytics - AI Tutor" }] }),
  component: TutorAnalyticsPage,
});

function formatScore(value: number | null) {
  return value === null ? "No attempts" : `${value}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function TutorAnalyticsPage() {
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const analyticsQuery = useQuery({
    queryKey: ["analytics", "tutor", "overview"],
    queryFn: getTutorAnalyticsOverview,
  });
  const attemptQuery = useQuery({
    queryKey: ["quiz-attempt", selectedAttemptId],
    queryFn: () => getQuizAttempt(selectedAttemptId ?? 0),
    enabled: selectedAttemptId !== null,
  });
  const reportQuery = useQuery({
    queryKey: ["weakness-report", selectedReportId],
    queryFn: () => getWeaknessReport(selectedReportId ?? 0),
    enabled: selectedReportId !== null,
  });
  const data = analyticsQuery.data;
  const recentAttempts = data?.recent_attempts.slice(0, 3) ?? [];
  const recentReports = data?.recent_reports.slice(0, 3) ?? [];

  return (
    <TutorLayout
      title="Analytics"
      subtitle="A live overview of your courses, learner activity, and generated weakness reports."
    >
      {analyticsQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading analytics...
        </Card>
      )}

      {analyticsQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{analyticsQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={BookOpen} label="Courses" value={String(data.summary.course_count)} />
            <MetricCard icon={Users} label="Students" value={String(data.summary.student_count)} />
            <MetricCard
              icon={HelpCircle}
              label="Quiz Attempts"
              value={String(data.summary.quiz_attempt_count)}
            />
            <MetricCard
              icon={BarChart3}
              label="Average Score"
              value={formatScore(data.summary.average_score)}
            />
            <MetricCard
              icon={FileText}
              label="Weak Topics"
              value={String(data.summary.weak_topic_count)}
            />
            <MetricCard
              icon={MessageSquare}
              label="Student Messages"
              value={String(data.summary.student_chat_message_count)}
            />
            <MetricCard label="Resources" value={String(data.summary.resource_count)} />
            <MetricCard label="Flashcard Sets" value={String(data.summary.flashcard_set_count)} />
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Course Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.course_activity.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Create a course to start collecting analytics.
                </div>
              )}
              {data.course_activity.map((course) => (
                <div
                  key={course.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_repeat(4,120px)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{course.title}</h3>
                      <Badge variant="secondary">{course.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.student_count} students enrolled
                    </p>
                  </div>
                  <MiniStat label="Quizzes" value={String(course.quiz_count)} />
                  <MiniStat label="Attempts" value={String(course.attempt_count)} />
                  <MiniStat label="Average" value={formatScore(course.average_score)} />
                  <MiniStat label="Weak Topics" value={String(course.weak_topic_count)} />
                  <Button asChild size="sm" variant="outline">
                    <Link to="/tutor/courses/$courseId" params={{ courseId: String(course.id) }}>
                      Open
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Quiz Attempts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAttempts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
                )}
                {recentAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    type="button"
                    onClick={() => setSelectedAttemptId(attempt.id)}
                    className="w-full rounded-lg border p-3 text-left transition hover:border-primary/50 hover:bg-accent"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{attempt.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.course_title} - {attempt.quiz_title}
                        </p>
                      </div>
                      <Badge variant="secondary">{attempt.score}%</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(attempt.attempted_at)}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Weakness Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReports.length === 0 && (
                  <p className="text-sm text-muted-foreground">No weakness reports generated yet.</p>
                )}
                {recentReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className="w-full rounded-lg border p-3 text-left transition hover:border-primary/50 hover:bg-accent"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{report.student_name}</p>
                        <p className="text-xs text-muted-foreground">{report.course_title}</p>
                      </div>
                      <Badge variant="secondary">{report.weak_topic_count} weak topics</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(report.generated_at)}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <QuizAttemptDialog
            open={selectedAttemptId !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedAttemptId(null);
            }}
            attempt={attemptQuery.data}
            isLoading={attemptQuery.isPending}
            error={attemptQuery.error}
          />
          <WeaknessReportDialog
            open={selectedReportId !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedReportId(null);
            }}
            report={reportQuery.data}
            isLoading={reportQuery.isPending}
            error={reportQuery.error}
          />
        </div>
      )}
    </TutorLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-3 p-4">
        {Icon && (
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function QuizAttemptDialog({
  open,
  onOpenChange,
  attempt,
  isLoading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attempt?: QuizAttemptResult;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Attempt</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Loading attempt...</p>}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {attempt && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{attempt.student_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.course_title} - {attempt.quiz_title} -{" "}
                    {formatDateTime(attempt.attempted_at)}
                  </p>
                </div>
                <Badge variant="secondary">{attempt.score}%</Badge>
              </div>
            </div>

            {attempt.answers.map((answer, index) => {
              const selectedChoice = answer.question.options.find(
                (option) => option.key === answer.selected_option,
              );
              const correctChoice = answer.question.options.find(
                (option) => option.key === answer.question.correct_option,
              );

              return (
                <div key={answer.question.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      {index + 1}. {answer.question.question_text}
                    </h3>
                    <Badge variant={answer.is_correct ? "secondary" : "destructive"}>
                      {answer.is_correct ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ChoiceBox
                      label="Selected Choice"
                      value={
                        answer.selected_option
                          ? `${answer.selected_option} - ${selectedChoice?.text ?? ""}`
                          : "Not answered"
                      }
                    />
                    <ChoiceBox
                      label="Correct Choice"
                      value={`${answer.question.correct_option} - ${correctChoice?.text ?? ""}`}
                    />
                  </div>
                  {answer.question.explanation && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {answer.question.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChoiceBox({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "wrong" | "correct";
}) {
  const toneClasses = {
    neutral: "border-transparent bg-muted/40 text-foreground",
    wrong: "border-red-200 bg-red-50 text-red-950",
    correct: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
  const labelClasses = {
    neutral: "text-muted-foreground",
    wrong: "text-red-700",
    correct: "text-emerald-700",
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className={`text-xs font-semibold ${labelClasses[tone]}`}>{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function WeaknessReportDialog({
  open,
  onOpenChange,
  report,
  isLoading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: WeaknessReport;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weakness Report</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Loading report...</p>}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {report && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{report.student_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.course_title} - {formatDateTime(report.generated_at)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {report.weak_topics.length} weak topic
                  {report.weak_topics.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6">{report.weakness_summary}</p>
            </div>

            {report.weak_topics.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No weak questions were detected for this report.
              </div>
            )}

            {report.weak_topics.map((topic) => {
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
                  <h3 className="mt-3 text-sm font-semibold">{topic.topic}</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ChoiceBox
                      label="Selected Choice"
                      value={
                        selectedChoices.length > 0
                          ? selectedChoices
                              .map((choice) =>
                                choice.text ? `${choice.key} - ${choice.text}` : choice.key,
                              )
                              .join(", ")
                          : "Not answered"
                      }
                      tone="wrong"
                    />
                    <ChoiceBox
                      label="Correct Choice"
                      value={`${topic.correct_option}${
                        topic.correct_choice ? ` - ${topic.correct_choice}` : ""
                      }`}
                      tone="correct"
                    />
                  </div>
                  {topic.explanation && (
                    <p className="mt-3 text-sm text-muted-foreground">{topic.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
