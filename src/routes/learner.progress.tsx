import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, HelpCircle, Layers, MessageSquare } from "lucide-react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLearnerAnalyticsOverview, getQuizAttempt, type QuizAttemptResult } from "@/lib/api";

export const Route = createFileRoute("/learner/progress")({
  head: () => ({ meta: [{ title: "Progress - AI Tutor" }] }),
  component: LearnerProgressPage,
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

function LearnerProgressPage() {
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const progressQuery = useQuery({
    queryKey: ["analytics", "learner", "overview"],
    queryFn: getLearnerAnalyticsOverview,
  });
  const attemptQuery = useQuery({
    queryKey: ["quiz-attempt", selectedAttemptId],
    queryFn: () => getQuizAttempt(selectedAttemptId ?? 0),
    enabled: selectedAttemptId !== null,
  });
  const data = progressQuery.data;
  const recentAttempts = data?.recent_attempts.slice(0, 3) ?? [];

  return (
    <LearnerLayout
      title="Progress"
      subtitle="Track your course activity, quiz performance, flashcards, and AI tutor usage."
    >
      {progressQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading progress...
        </Card>
      )}

      {progressQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{progressQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={BookOpen}
              label="Enrolled Courses"
              value={String(data.summary.enrolled_course_count)}
            />
            <MetricCard
              icon={HelpCircle}
              label="Quiz Attempts"
              value={String(data.summary.quiz_attempt_count)}
            />
            <MetricCard
              icon={BarChart3}
              label="Best Score"
              value={formatScore(data.summary.best_score)}
            />
            <MetricCard
              icon={BarChart3}
              label="Average Score"
              value={formatScore(data.summary.average_score)}
            />
            <MetricCard
              icon={Layers}
              label="Flashcards"
              value={String(data.summary.flashcard_card_count)}
            />
            <MetricCard
              icon={MessageSquare}
              label="Chat Sessions"
              value={String(data.summary.chat_session_count)}
            />
            <MetricCard
              icon={MessageSquare}
              label="Student Messages"
              value={String(data.summary.student_chat_message_count)}
            />
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.course_progress.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm font-medium">No enrolled courses yet</p>
                  <Button asChild className="mt-4 gradient-ai text-white">
                    <Link to="/learner/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
              {data.course_progress.map((course) => (
                <div
                  key={course.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_repeat(4,120px)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{course.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{course.teacher_name}</p>
                  </div>
                  <MiniStat label="Quizzes" value={String(course.quiz_count)} />
                  <MiniStat label="Attempts" value={String(course.attempt_count)} />
                  <MiniStat label="Best" value={formatScore(course.best_score)} />
                  <MiniStat label="Average" value={formatScore(course.average_score)} />
                  <Button asChild size="sm" variant="outline">
                    <Link to="/learner/courses/$courseId" params={{ courseId: String(course.id) }}>
                      Open
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

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
                      <p className="text-sm font-semibold">{attempt.quiz_title}</p>
                      <p className="text-xs text-muted-foreground">{attempt.course_title}</p>
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

          <QuizAttemptDialog
            open={selectedAttemptId !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedAttemptId(null);
            }}
            attempt={attemptQuery.data}
            isLoading={attemptQuery.isPending}
            error={attemptQuery.error}
          />
        </div>
      )}
    </LearnerLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
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
                  <p className="text-sm font-semibold">{attempt.quiz_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.course_title} - {formatDateTime(attempt.attempted_at)}
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

function ChoiceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
