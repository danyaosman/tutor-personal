import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Sparkles, Save } from "lucide-react";

export const Route = createFileRoute("/tutor/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — AI Tutor" }] }),
  component: DigitalTwin,
});

function DigitalTwin() {
  return (
    <TutorLayout
      title="Digital Twin"
      subtitle="Configure your AI teaching persona — voice, tone, and pedagogy."
      actions={
        <Button className="gradient-ai text-white shadow-glow hover:opacity-90">
          <Save className="h-4 w-4" /> Save & Update Digital Twin
        </Button>
      }
    >
      <Card className="mb-6 overflow-hidden border-border/60 shadow-soft">
        <div className="gradient-ai-soft p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-ai text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Digital Twin Training</h3>
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Not Started</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Add samples and configure your persona, then start training.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Tutor Profile</CardTitle>
            <CardDescription>Basic information your twin will represent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input defaultValue="Dr. Maya Chen" /></div>
            <div className="space-y-1.5"><Label>Subject expertise</Label><Input defaultValue="Computer Science, ML" /></div>
            <div className="space-y-1.5"><Label>Bio</Label><Textarea rows={4} defaultValue="Passionate about making complex ideas approachable for first-year students." /></div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Teaching Style</CardTitle>
            <CardDescription>How your twin explains things by default.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Preferred explanation style</Label>
              <Select defaultValue="step">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conceptual">Conceptual</SelectItem>
                  <SelectItem value="step">Step-by-step</SelectItem>
                  <SelectItem value="socratic">Socratic</SelectItem>
                  <SelectItem value="example">Example-driven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tone of voice</Label>
              <Select defaultValue="encouraging">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="encouraging">Encouraging</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Complexity level</Label><span className="text-xs text-muted-foreground">Intermediate</span></div>
              <Slider defaultValue={[50]} max={100} step={1} />
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>Beginner</span><span>Advanced</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Voice & Video Samples</CardTitle>
            <CardDescription>Upload voice or video samples to personalize your AI twin.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: connect to voice/video processing pipeline */}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-10 text-center transition hover:border-primary hover:bg-accent/40">
              <div className="grid h-12 w-12 place-items-center rounded-full gradient-ai text-white shadow-glow">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">Drop files here or click to upload</div>
              <div className="text-xs text-muted-foreground">MP3, WAV, MP4, MOV · up to 500 MB</div>
              <input type="file" className="sr-only" multiple />
            </label>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>AI Personality</CardTitle>
            <CardDescription>Fine-tune how your twin engages students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Use humor","Ask follow-up questions","Summarize at end of answers","Cite sources"].map((opt, i) => (
              <label key={opt} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:bg-accent/40">
                <Checkbox defaultChecked={i !== 0} />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  );
}
