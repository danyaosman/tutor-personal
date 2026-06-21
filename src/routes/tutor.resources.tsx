import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resources, type ResourceStatus, type ResourceType } from "@/data/mockData";
import { UploadCloud, FileText, Video, Music, Link as LinkIcon, NotebookText, Eye, Pencil, Trash2, Info, Plus } from "lucide-react";

export const Route = createFileRoute("/tutor/resources")({
  head: () => ({ meta: [{ title: "Resources — AI Tutor" }] }),
  component: ResourcesPage,
});

const typeIcon: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
  PDF: FileText, Video, Audio: Music, Link: LinkIcon, Notes: NotebookText,
};

const typeColor: Record<ResourceType, string> = {
  PDF: "bg-red-500/10 text-red-600",
  Video: "bg-purple-500/10 text-purple-600",
  Audio: "bg-blue-500/10 text-blue-600",
  Link: "bg-cyan-500/10 text-cyan-600",
  Notes: "bg-emerald-500/10 text-emerald-600",
};

const statusColor: Record<ResourceStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  Processing: "bg-amber-500/10 text-amber-600",
  Processed: "bg-emerald-500/10 text-emerald-600",
  Failed: "bg-red-500/10 text-red-600",
};

function ResourcesPage() {
  return (
    <TutorLayout
      title="Course Resources"
      subtitle="Upload materials your Digital Twin will learn from."
      actions={
        <Button className="gradient-ai text-white shadow-glow hover:opacity-90"><Plus className="h-4 w-4" /> Upload Resource</Button>
      }
    >
      {/* TODO: connect to file storage and AI processing pipeline */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-secondary/40 to-accent/30 px-6 py-10 text-center transition hover:border-primary">
        <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-ai text-white shadow-glow">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="mt-2 text-base font-semibold">Drop files to upload</div>
        <div className="text-xs text-muted-foreground">Accepted: PDF · Video · Audio · External Link · Notes</div>
        <input type="file" className="sr-only" multiple />
      </label>

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Related Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => {
                const Icon = typeIcon[r.type];
                return (
                  <TableRow key={r.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg ${typeColor[r.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="truncate">{r.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className={typeColor[r.type]}>{r.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{r.course}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColor[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.updated}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button size="icon" variant="ghost" aria-label="View"><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" aria-label="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border/60 gradient-ai-soft p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Uploaded resources will be processed by the AI model and used to train your course Digital Twin. Processing may take a few minutes.
          {/* TODO: connect to AI ingestion pipeline */}
        </p>
      </div>
    </TutorLayout>
  );
}
