import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFlashcardSet, listEnrolledCourses, listFlashcardSets } from "@/lib/api";
import { ArrowLeft, ArrowRight, Layers, Loader2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/learner/flashcards")({
  head: () => ({ meta: [{ title: "Flashcards - AI Tutor" }] }),
  component: LearnerFlashcards,
});

function LearnerFlashcards() {
  const [activeSetId, setActiveSetId] = useState<number | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const coursesQuery = useQuery({
    queryKey: ["learner-enrolled-courses"],
    queryFn: listEnrolledCourses,
  });

  const setsQuery = useQuery({
    queryKey: ["learner-flashcard-sets"],
    queryFn: listFlashcardSets,
  });

  const filteredSets =
    setsQuery.data?.filter(
      (set) => selectedCourseId === "all" || set.course_id === Number(selectedCourseId),
    ) ?? [];

  const detailQuery = useQuery({
    queryKey: ["learner-flashcard-set", activeSetId],
    queryFn: () => getFlashcardSet(activeSetId ?? 0),
    enabled: Boolean(activeSetId),
  });

  useEffect(() => {
    if (filteredSets.length === 0) {
      setActiveSetId(null);
      return;
    }
    if (!activeSetId || !filteredSets.some((set) => set.id === activeSetId)) {
      setActiveSetId(filteredSets[0].id);
    }
  }, [activeSetId, filteredSets]);

  useEffect(() => {
    setActiveCardIndex(0);
    setIsFlipped(false);
  }, [activeSetId]);

  const activeSet = detailQuery.data;
  const cards = activeSet?.cards ?? [];
  const activeCard = cards[activeCardIndex];

  function showPreviousCard() {
    setActiveCardIndex((current) => Math.max(current - 1, 0));
    setIsFlipped(false);
  }

  function showNextCard() {
    setActiveCardIndex((current) => Math.min(current + 1, cards.length - 1));
    setIsFlipped(false);
  }

  return (
    <LearnerLayout
      title="Flashcards"
      subtitle="Review flashcards generated from your enrolled course PDFs."
      actions={
        <Button asChild variant="outline">
          <Link to="/learner/courses">Generate from a Course</Link>
        </Button>
      }
    >
      {(setsQuery.data?.length ?? 0) > 0 && (
        <div className="flex justify-end mb-5">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All enrolled courses</SelectItem>
              {coursesQuery.data?.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {setsQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading flashcard sets...
        </Card>
      )}

      {setsQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{setsQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {setsQuery.data?.length === 0 && (
        <Card className="border-dashed p-10 text-center shadow-soft">
          <Layers className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No flashcards yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open an enrolled course and generate flashcards from its processed resources.
          </p>
          <Button asChild className="mt-4 gradient-ai text-white">
            <Link to="/learner/courses">Open Courses</Link>
          </Button>
        </Card>
      )}

      {(setsQuery.data?.length ?? 0) > 0 && filteredSets.length === 0 && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          No flashcard sets match this course filter.
        </Card>
      )}

      {filteredSets.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-fit shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" /> Sets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredSets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setActiveSetId(set.id)}
                  className={[
                    "w-full rounded-lg border p-3 text-left transition hover:bg-accent",
                    activeSetId === set.id ? "border-primary bg-accent" : "bg-background",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold">{set.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{set.course_title}</div>
                  <Badge variant="secondary" className="mt-2">
                    {set.card_count} cards
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="min-h-[520px] shadow-soft">
            <CardHeader>
              <CardTitle>{activeSet?.title ?? "Flashcard Review"}</CardTitle>
            </CardHeader>
            <CardContent>
              {detailQuery.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading cards...
                </div>
              )}

              {detailQuery.error && (
                <Alert variant="destructive">
                  <AlertDescription>{detailQuery.error.message}</AlertDescription>
                </Alert>
              )}

              {activeCard && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>
                      Card {activeCardIndex + 1} of {cards.length}
                    </span>
                    <span>{activeSet?.course_title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFlipped((current) => !current)}
                    className="grid min-h-[300px] w-full place-items-center rounded-xl border bg-secondary/20 p-8 text-center transition hover:border-primary/50"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {isFlipped ? "Back" : "Front"}
                      </div>
                      <div className="mt-4 text-xl font-semibold leading-relaxed">
                        {isFlipped ? activeCard.back : activeCard.front}
                      </div>
                      <div className="mt-6 text-xs text-muted-foreground">Click to flip</div>
                    </div>
                  </button>

                  <div className="flex flex-wrap justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={showPreviousCard}
                      disabled={activeCardIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>

                    <Button
                      onClick={showNextCard}
                      disabled={activeCardIndex >= cards.length - 1}
                      className="gradient-ai text-white"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </LearnerLayout>
  );
}
