import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
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
  chatWithCourse,
  listEnrolledCourses,
  type CourseChatResponse,
  type CourseChatSource,
} from "@/lib/api";
import { BookOpen, FileText, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/learner/ask")({
  head: () => ({ meta: [{ title: "Ask AI Tutor - AI Tutor" }] }),
  component: LearnerAsk,
});

function LearnerAsk() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [question, setQuestion] = useState("");
  const [latestAnswer, setLatestAnswer] = useState<CourseChatResponse | null>(null);
  const [selectedSource, setSelectedSource] = useState<CourseChatSource | null>(null);
  const coursesQuery = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: listEnrolledCourses,
  });
  const chatMutation = useMutation({
    mutationFn: ({ courseId, message }: { courseId: number; message: string }) =>
      chatWithCourse(courseId, message),
    onSuccess: (response) => {
      setLatestAnswer(response);
      setSelectedSource(response.sources[0] ?? null);
      setQuestion("");
    },
  });

  return (
    <LearnerLayout
      title="Ask AI Tutor"
      subtitle="Ask a question and get an answer grounded in the selected course PDFs."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Course Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!selectedCourseId || !question.trim()) return;
                setSelectedSource(null);
                chatMutation.mutate({
                  courseId: Number(selectedCourseId),
                  message: question.trim(),
                });
              }}
            >
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        coursesQuery.isPending ? "Loading your courses..." : "Pick a course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesQuery.data?.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {coursesQuery.data?.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Enroll in a course first before asking the AI tutor.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="question">Your question</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: What are the main goals of this course?"
                  className="min-h-[180px]"
                />
              </div>

              {chatMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>{chatMutation.error.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!selectedCourseId || !question.trim() || chatMutation.isPending}
                  className="gradient-ai text-white shadow-glow"
                >
                  <Send className="h-4 w-4" />
                  {chatMutation.isPending ? "Asking..." : "Ask AI Tutor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-primary/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!latestAnswer && (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No answer yet</p>
                <p className="text-xs text-muted-foreground">
                  Select an active course and ask a question.
                </p>
              </div>
            )}

            {latestAnswer && (
              <div className="space-y-4">
                <div className="rounded-lg bg-background/80 p-4 text-sm whitespace-pre-wrap">
                  {latestAnswer.answer}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" /> Sources
                  </div>
                  <div className="space-y-2">
                    {latestAnswer.sources.map((source) => (
                      <button
                        key={sourceKey(source)}
                        type="button"
                        onClick={() => setSelectedSource(source)}
                        className={[
                          "w-full rounded-lg border p-3 text-left transition hover:border-amber-400 hover:bg-amber-50",
                          selectedSource && sourceKey(selectedSource) === sourceKey(source)
                            ? "border-amber-400 bg-amber-50"
                            : "bg-background/70",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold">{source.file_name}</span>
                          <Badge variant="secondary">
                            {source.page_number ? `Page ${source.page_number}` : "PDF"}
                          </Badge>
                        </div>
                        <mark className="mt-2 line-clamp-3 rounded bg-amber-100 px-1 py-0.5 text-xs leading-relaxed text-amber-950">
                          {source.preview}
                        </mark>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedSource && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Highlighted citation
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">
                        {selectedSource.file_name}
                      </span>
                      <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-200">
                        {selectedSource.page_number ? `Page ${selectedSource.page_number}` : "PDF"}
                      </Badge>
                    </div>
                    <mark className="mt-2 block rounded bg-amber-200/80 p-3 text-xs leading-relaxed text-amber-950">
                      {selectedSource.preview}
                    </mark>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
}

function sourceKey(source: CourseChatSource) {
  return `${source.resource_id}-${source.chunk_index}`;
}
