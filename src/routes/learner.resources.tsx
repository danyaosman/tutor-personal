import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { learnerResources } from "@/data/mockData";
import { FileText, Video, Link as LinkIcon, NotebookPen, Search, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/learner/resources")({
  head: () => ({ meta: [{ title: "Library — AI Tutor" }] }),
  component: LearnerResourcesPage,
});

const typeIcon = { PDF: FileText, Video: Video, Notes: NotebookPen, Link: LinkIcon } as const;
const typeTone: Record<string, string> = {
  PDF: "bg-rose-500/10 text-rose-600",
  Video: "bg-purple-500/10 text-purple-600",
  Notes: "bg-blue-500/10 text-blue-600",
  Link: "bg-cyan-500/10 text-cyan-600",
};

function LearnerResourcesPage() {
  const [query, setQuery] = useState("");
  const filtered = learnerResources.filter(
    (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.course.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <LearnerLayout title="Library" subtitle="Every resource your tutors have shared, in one place.">
      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources…" className="pl-9" />
      </div>

      <div className="grid gap-3">
        {filtered.map((r) => {
          const Icon = typeIcon[r.type];
          return (
            <Card key={r.id} className="flex flex-wrap items-center gap-4 border-border/60 p-4 shadow-soft transition hover:shadow-glow/40">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className={typeTone[r.type]}>{r.type}</Badge>
                  <span>{r.course}</span>
                  <span>·</span>
                  <span>{r.updated}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* TODO: connect to backend API — toggle bookmark */}
                <Button variant="outline" size="icon" aria-label="Bookmark">
                  {r.bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </Button>
                <Button className="gradient-ai text-white shadow-glow"><ExternalLink className="h-4 w-4" /> Open</Button>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No resources match "{query}".
          </div>
        )}
      </div>
    </LearnerLayout>
  );
}
