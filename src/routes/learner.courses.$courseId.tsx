import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  chatWithCourse,
  generateCourseFlashcards,
  generateCourseQuiz,
  getChatSession,
  listCourseChatSessions,
  listEnrolledCourses,
  listLearnerCourseResources,
  resolveFileUrl,
  type CourseChatResponse,
  type CourseChatSource,
  type CourseResource,
} from "@/lib/api";
import {
  ArrowLeft,
  Bot,
  Brain,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  Layers,
  Search,
  Send,
  User,
} from "lucide-react";

export const Route = createFileRoute("/learner/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course Notebook - AI Tutor" }] }),
  component: LearnerCourseNotebook,
});

type ChatBubble = {
  id: string;
  role: "student" | "ai";
  text: string;
  sources?: CourseChatResponse["sources"];
};

const processSteps = [
  "Reading your question...",
  "Searching the course resources...",
  "Selecting the most relevant PDF chunks...",
  "Preparing a grounded answer...",
];

function LearnerCourseNotebook() {
  const { courseId: courseIdParam } = Route.useParams();
  const courseId = Number(courseIdParam);
  const queryClient = useQueryClient();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
  const [sessionLoadError, setSessionLoadError] = useState("");

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const [activeSteps, setActiveSteps] = useState<string[]>([]);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [streamingSources, setStreamingSources] = useState<CourseChatResponse["sources"]>([]);
  const [selectedSource, setSelectedSource] = useState<CourseChatSource | null>(null);
  const [studyToolMessage, setStudyToolMessage] = useState("");

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  const enrolledCoursesQuery = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: listEnrolledCourses,
  });

  const resourcesQuery = useQuery({
    queryKey: ["learner-course-resources", courseId],
    queryFn: () => listLearnerCourseResources(courseId),
    enabled: Boolean(courseId),
  });

  const chatSessionsQuery = useQuery({
    queryKey: ["course-chat-sessions", courseId],
    queryFn: () => listCourseChatSessions(courseId),
    enabled: Boolean(courseId),
  });

  const course = useMemo(
    () => enrolledCoursesQuery.data?.find((item) => item.id === courseId),
    [courseId, enrolledCoursesQuery.data],
  );

  const recentSessions = chatSessionsQuery.data?.slice(0, 3) ?? [];

  const filteredSessions =
    chatSessionsQuery.data?.filter((session) =>
      session.last_message?.message_text?.toLowerCase().includes(historySearch.toLowerCase()),
    ) ?? [];

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      chatWithCourse(courseId, message, activeSessionId ?? undefined),

    onSuccess: (response) => {
      setActiveSessionId(response.session_id);

      queryClient.invalidateQueries({
        queryKey: ["course-chat-sessions", courseId],
      });

      window.setTimeout(() => {
        setActiveSteps([]);
        animateAnswer(response.answer, response.sources);
      }, 700);
    },

    onError: () => {
      setActiveSteps([]);
    },
  });

  const generateQuizMutation = useMutation({
    mutationFn: () => generateCourseQuiz(courseId, { question_count: 5, difficulty_level: "medium" }),
    onSuccess: async (quiz) => {
      setStudyToolMessage(`Created "${quiz.title}" with ${quiz.questions.length} questions.`);
      await queryClient.invalidateQueries({ queryKey: ["learner-quizzes"] });
    },
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: () => generateCourseFlashcards(courseId, 10),
    onSuccess: async (cardSet) => {
      setStudyToolMessage(`Created "${cardSet.title}" with ${cardSet.cards.length} cards.`);
      await queryClient.invalidateQueries({ queryKey: ["learner-flashcard-sets"] });
    },
  });

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const scrollFrame = window.requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [messages.length, streamingAnswer, activeSteps.length]);

  function animateAnswer(answer: string, sources: CourseChatResponse["sources"]) {
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
    }

    const words = answer.split(/(\s+)/);
    let index = 0;

    setStreamingAnswer("");
    setStreamingSources(sources);

    streamTimerRef.current = window.setInterval(() => {
      index += 1;
      setStreamingAnswer(words.slice(0, index).join(""));

      if (index >= words.length) {
        if (streamTimerRef.current) {
          window.clearInterval(streamTimerRef.current);
        }

        streamTimerRef.current = null;

        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-ai`,
            role: "ai",
            text: answer,
            sources,
          },
        ]);

        setStreamingAnswer("");
        setStreamingSources([]);
      }
    }, 28);
  }

  async function openSession(sessionId: number) {
    try {
      setLoadingSessionId(sessionId);
      setSessionLoadError("");

      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }

      const session = await getChatSession(sessionId);

      setActiveSessionId(session.id);
      setSelectedSource(null);
      setStreamingAnswer("");
      setStreamingSources([]);
      setActiveSteps([]);
      setQuestion("");

      setMessages(
        session.messages.map((message) => ({
          id: String(message.id),
          role: message.sender === "student" ? "student" : "ai",
          text: message.message_text,
          sources: message.source_references,
        })),
      );

      setIsHistoryDialogOpen(false);
    } catch (error) {
      setSessionLoadError(error instanceof Error ? error.message : "Failed to load chat session.");
    } finally {
      setLoadingSessionId(null);
    }
  }

  function startNewChat() {
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    setActiveSessionId(null);
    setMessages([]);
    setSelectedSource(null);
    setStreamingAnswer("");
    setStreamingSources([]);
    setActiveSteps([]);
    setQuestion("");
    setSessionLoadError("");
  }

  function submitQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || chatMutation.isPending || streamingAnswer) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-student`,
        role: "student",
        text: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setActiveSteps(processSteps);
    setSelectedSource(null);
    setSessionLoadError("");
    chatMutation.mutate(trimmedQuestion);
  }

  return (
    <LearnerLayout
      title={course?.title ?? "Course Notebook"}
      subtitle="Use the course resources and chat with the AI tutor in one workspace."
      actions={
        <Button asChild variant="outline">
          <Link to="/learner/courses">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </Button>
      }
    >
      {enrolledCoursesQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading course notebook...
        </Card>
      )}

      {enrolledCoursesQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{enrolledCoursesQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {!enrolledCoursesQuery.isPending && !course && (
        <Alert variant="destructive">
          <AlertDescription>
            You are not enrolled in this active course, or it is no longer available.
          </AlertDescription>
        </Alert>
      )}

      {course && (
        <>
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-5">
              <Card className="h-fit border-primary/20 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" /> Study Tools
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        setStudyToolMessage("");
                        generateQuizMutation.mutate();
                      }}
                      disabled={generateQuizMutation.isPending}
                      className="gradient-ai text-white"
                    >
                      {generateQuizMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <HelpCircle className="h-4 w-4" />
                      )}
                      Quiz
                    </Button>

                    <Button
                      onClick={() => {
                        setStudyToolMessage("");
                        generateFlashcardsMutation.mutate();
                      }}
                      disabled={generateFlashcardsMutation.isPending}
                      variant="outline"
                    >
                      {generateFlashcardsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                      Cards
                    </Button>
                  </div>

                  {(generateQuizMutation.error || generateFlashcardsMutation.error) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {generateQuizMutation.error?.message ??
                          generateFlashcardsMutation.error?.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {studyToolMessage && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{studyToolMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/learner/quizzes">Open Quizzes</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/learner/flashcards">Open Cards</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-fit shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> Chat History
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Button onClick={startNewChat} variant="outline" className="w-full">
                    <Plus className="h-4 w-4" /> New Chat
                  </Button>

                  {chatSessionsQuery.isPending && (
                    <p className="text-sm text-muted-foreground">Loading chat history...</p>
                  )}

                  {chatSessionsQuery.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{chatSessionsQuery.error.message}</AlertDescription>
                    </Alert>
                  )}

                  {sessionLoadError && (
                    <Alert variant="destructive">
                      <AlertDescription>{sessionLoadError}</AlertDescription>
                    </Alert>
                  )}

                  {chatSessionsQuery.data?.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                      <p className="text-sm font-medium">No previous chats yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Start a new chat to save your conversation here.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {recentSessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => openSession(session.id)}
                        className={[
                          "w-full rounded-lg border p-3 text-left text-sm transition hover:bg-accent",
                          activeSessionId === session.id
                            ? "border-primary bg-accent"
                            : "bg-background",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">Chat #{session.id}</span>

                          {loadingSessionId === session.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          )}
                        </div>

                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {session.last_message?.message_text ?? "No messages yet"}
                        </div>
                      </button>
                    ))}
                  </div>

                  {(chatSessionsQuery.data?.length ?? 0) > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setIsHistoryDialogOpen(true)}
                    >
                      View more
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="h-fit shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Course Resources
                  </CardTitle>
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
                    <div className="rounded-lg border border-dashed p-5 text-center">
                      <p className="text-sm font-medium">No completed resources yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ask the tutor to upload a readable PDF.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {resourcesQuery.data?.map((resource) => {
                      const isHighlighted = selectedSource?.resource_id === resource.id;

                      return (
                        <div
                          key={resource.id}
                          className={[
                            "rounded-lg border p-3 transition",
                            isHighlighted
                              ? "border-amber-400 bg-amber-50 shadow-sm"
                              : "bg-background",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={[
                                "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                                isHighlighted
                                  ? "bg-amber-200 text-amber-700"
                                  : "bg-red-500/10 text-red-600",
                              ].join(" ")}
                            >
                              <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold">
                                {resource.file_name}
                              </div>
                              <Badge variant="secondary" className="mt-1 capitalize">
                                {resource.processing_status}
                              </Badge>
                            </div>
                          </div>

                          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                            <a
                              href={resolveFileUrl(resource.file)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" /> Open PDF
                            </a>
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {selectedSource && (
                    <CitationEvidencePanel
                      source={selectedSource}
                      resource={resourcesQuery.data?.find(
                        (resource) => resource.id === selectedSource.resource_id,
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="h-[min(760px,calc(100vh-7rem))] min-h-[640px] shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" /> AI Tutor Chat
                </CardTitle>
              </CardHeader>

              <CardContent className="flex h-[calc(100%-76px)] min-h-0 flex-col">
                <div
                  ref={chatScrollRef}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border bg-secondary/20 p-4"
                >
                  {messages.length === 0 && !streamingAnswer && activeSteps.length === 0 && (
                    <div className="grid min-h-[300px] place-items-center text-center">
                      <div>
                        <Bot className="mx-auto h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-3 font-semibold">Ask about this course</h3>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                          The AI tutor will search the course PDFs and answer using the most
                          relevant extracted chunks.
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      selectedSource={selectedSource}
                      onSelectSource={setSelectedSource}
                    />
                  ))}

                  {activeSteps.length > 0 && (
                    <div className="rounded-xl border bg-background p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" /> AI tutor is working
                      </div>
                      <div className="mt-3 space-y-2">
                        {activeSteps.map((step) => (
                          <div key={step} className="text-sm text-muted-foreground">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {streamingAnswer && (
                    <ChatMessageBubble
                      message={{
                        id: "streaming-answer",
                        role: "ai",
                        text: streamingAnswer,
                        sources: streamingSources,
                      }}
                      selectedSource={selectedSource}
                      onSelectSource={setSelectedSource}
                    />
                  )}
                  <div ref={chatEndRef} />
                </div>

                {chatMutation.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{chatMutation.error.message}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 flex gap-3">
                  <Textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask a question about the course resources..."
                    className="min-h-[76px]"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submitQuestion();
                      }
                    }}
                  />

                  <Button
                    onClick={submitQuestion}
                    disabled={
                      !question.trim() || chatMutation.isPending || Boolean(streamingAnswer)
                    }
                    className="self-end gradient-ai text-white"
                  >
                    <Send className="h-4 w-4" /> Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>All Chat History</DialogTitle>
              </DialogHeader>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Search previous conversations..."
                  className="pl-9"
                />
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto">
                {filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => openSession(session.id)}
                    className={[
                      "w-full rounded-lg border p-3 text-left text-sm transition hover:bg-accent",
                      activeSessionId === session.id ? "border-primary bg-accent" : "bg-background",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Chat #{session.id}</span>

                      {loadingSessionId === session.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {session.last_message?.message_text ?? "No messages yet"}
                    </div>
                  </button>
                ))}

                {filteredSessions.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No conversations found.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </LearnerLayout>
  );
}

function CitationEvidencePanel({
  source,
  resource,
}: {
  source: CourseChatSource;
  resource?: CourseResource;
}) {
  const pageUrl =
    resource && source.page_number
      ? `${resolveFileUrl(resource.file)}#page=${source.page_number}`
      : resource
        ? resolveFileUrl(resource.file)
        : "";

  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Highlighted Citation
          </div>
          <div className="mt-1 truncate text-sm font-semibold">{source.file_name}</div>
        </div>

        <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-200">
          {source.page_number ? `Page ${source.page_number}` : "PDF"}
        </Badge>
      </div>

      <mark className="mt-3 block rounded-lg bg-amber-200/80 p-3 text-xs leading-relaxed text-amber-950">
        {source.preview}
      </mark>

      {pageUrl && (
        <Button asChild size="sm" variant="outline" className="mt-3 w-full bg-background">
          <a href={pageUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> Open cited PDF page
          </a>
        </Button>
      )}
    </div>
  );
}

function sourceKey(source: CourseChatSource) {
  return `${source.resource_id}-${source.chunk_index}`;
}

function ChatMessageBubble({
  message,
  selectedSource,
  onSelectSource,
}: {
  message: ChatBubble;
  selectedSource: CourseChatSource | null;
  onSelectSource: (source: CourseChatSource) => void;
}) {
  const isStudent = message.role === "student";

  return (
    <div className={["flex", isStudent ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[85%] rounded-2xl p-4 text-sm",
          isStudent ? "bg-primary text-primary-foreground" : "border bg-background text-foreground",
        ].join(" ")}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold opacity-80">
          {isStudent ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          {isStudent ? "You" : "AI Tutor"}
        </div>

        <div className="whitespace-pre-wrap">{message.text}</div>

        {!isStudent && message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Sources</div>

            {message.sources.map((source) => (
              <button
                key={sourceKey(source)}
                type="button"
                onClick={() => onSelectSource(source)}
                className={[
                  "w-full rounded-lg border p-3 text-left transition hover:border-amber-400 hover:bg-amber-50",
                  selectedSource && sourceKey(selectedSource) === sourceKey(source)
                    ? "border-amber-400 bg-amber-50"
                    : "bg-secondary/40",
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
        )}
      </div>
    </div>
  );
}
