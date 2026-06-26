import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getQuiz,
  listQuizzes,
  submitQuizAttempt,
  type QuizAttemptResult,
  type QuizDetail,
} from "@/lib/api";
import { CheckCircle2, Loader2, Play, RotateCcw, XCircle } from "lucide-react";

export const Route = createFileRoute("/learner/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes - AI Tutor" }] }),
  component: LearnerQuizzes,
});

function LearnerQuizzes() {
  const queryClient = useQueryClient();
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  const quizzesQuery = useQuery({
    queryKey: ["learner-quizzes"],
    queryFn: listQuizzes,
  });

  const quizDetailQuery = useQuery({
    queryKey: ["learner-quiz-detail", activeQuizId],
    queryFn: () => getQuiz(activeQuizId ?? 0),
    enabled: Boolean(activeQuizId),
  });

  const submitMutation = useMutation({
    mutationFn: (quiz: QuizDetail) =>
      submitQuizAttempt(
        quiz.id,
        quiz.questions.map((question) => ({
          question_id: question.id,
          selected_option: answers[question.id] ?? "",
        })),
      ),
    onSuccess: async (attempt) => {
      setResult(attempt);
      await queryClient.invalidateQueries({ queryKey: ["learner-quizzes"] });
    },
  });

  useEffect(() => {
    setAnswers({});
    setResult(null);
  }, [activeQuizId]);

  const activeQuiz = quizDetailQuery.data;
  const answeredCount = activeQuiz?.questions.filter((question) => answers[question.id]).length ?? 0;
  const canSubmit = Boolean(activeQuiz) && answeredCount === activeQuiz!.questions.length;

  return (
    <LearnerLayout
      title="Quizzes"
      subtitle="Take practice quizzes generated from your enrolled course PDFs."
      actions={
        <Button asChild variant="outline">
          <Link to="/learner/courses">Generate from a Course</Link>
        </Button>
      }
    >
      {quizzesQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading quizzes...
        </Card>
      )}

      {quizzesQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{quizzesQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {quizzesQuery.data?.length === 0 && (
        <Card className="border-dashed p-10 text-center shadow-soft">
          <h3 className="font-semibold">No quizzes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open an enrolled course and generate a quiz from its processed resources.
          </p>
          <Button asChild className="mt-4 gradient-ai text-white">
            <Link to="/learner/courses">Open Courses</Link>
          </Button>
        </Card>
      )}

      {(quizzesQuery.data?.length ?? 0) > 0 && (
        <Card className="shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Best Score</TableHead>
                <TableHead className="text-right">Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzesQuery.data?.map((quiz) => {
                const completed = quiz.attempt_count > 0;

                return (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-semibold">{quiz.title}</TableCell>
                    <TableCell className="text-muted-foreground">{quiz.course_title}</TableCell>
                    <TableCell className="text-right">{quiz.question_count}</TableCell>
                    <TableCell className="text-right">
                      {quiz.best_score !== null ? `${quiz.best_score}%` : "-"}
                    </TableCell>
                    <TableCell className="text-right">{quiz.attempt_count}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          completed
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        }
                      >
                        {completed ? "Completed" : "Ready"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gradient-ai text-white shadow-glow"
                        onClick={() => setActiveQuizId(quiz.id)}
                      >
                        {completed ? (
                          <RotateCcw className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        {completed ? "Retake" : "Start"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={Boolean(activeQuizId)}
        onOpenChange={(open) => {
          if (!open) setActiveQuizId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeQuiz?.title ?? "Quiz"}</DialogTitle>
          </DialogHeader>

          {quizDetailQuery.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading questions...
            </div>
          )}

          {quizDetailQuery.error && (
            <Alert variant="destructive">
              <AlertDescription>{quizDetailQuery.error.message}</AlertDescription>
            </Alert>
          )}

          {submitMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>{submitMutation.error.message}</AlertDescription>
            </Alert>
          )}

          {activeQuiz && !result && (
            <div className="space-y-5">
              <div className="text-sm text-muted-foreground">
                {answeredCount} of {activeQuiz.questions.length} answered
              </div>

              {activeQuiz.questions.map((question, index) => (
                <div key={question.id} className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Question {index + 1}
                  </div>
                  <div className="mt-1 font-semibold">{question.question_text}</div>

                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) =>
                      setAnswers((current) => ({ ...current, [question.id]: value }))
                    }
                    className="mt-4 space-y-2"
                  >
                    {question.options.map((option) => {
                      const id = `q-${question.id}-${option.key}`;

                      return (
                        <div key={option.key} className="flex items-center gap-2">
                          <RadioGroupItem value={option.key} id={id} />
                          <Label htmlFor={id} className="text-sm leading-relaxed">
                            <span className="font-semibold">{option.key}.</span> {option.text}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="text-sm font-semibold text-emerald-700">Quiz submitted</div>
                <div className="mt-1 text-3xl font-bold text-emerald-700">{result.score}%</div>
              </div>

              {result.answers.map((answer, index) => (
                <div key={answer.question.id} className="rounded-xl border p-4">
                  <div className="flex items-start gap-2">
                    {answer.is_correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        Question {index + 1}
                      </div>
                      <div className="mt-1 font-semibold">{answer.question.question_text}</div>
                      <div className="mt-3 text-sm">
                        Your answer:{" "}
                        <span className="font-semibold">
                          {answer.selected_option || "No answer"}
                        </span>
                      </div>
                      <div className="text-sm">
                        Correct answer:{" "}
                        <span className="font-semibold">{answer.question.correct_option}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {answer.question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveQuizId(null)}>
              Close
            </Button>
            {activeQuiz && !result && (
              <Button
                disabled={!canSubmit || submitMutation.isPending}
                className="gradient-ai text-white"
                onClick={() => submitMutation.mutate(activeQuiz)}
              >
                {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Quiz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LearnerLayout>
  );
}
