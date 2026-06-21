import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { learnerProfile, learnerNotificationDefaults, learnerPreferenceDefaults } from "@/data/mockData";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/learner/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Tutor" }] }),
  component: LearnerSettings,
});

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-secondary/30 p-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LearnerSettings() {
  const [notif, setNotif] = useState(learnerNotificationDefaults);
  const [prefs, setPrefs] = useState(learnerPreferenceDefaults);

  return (
    <LearnerLayout title="Settings" subtitle="Personalize your learning experience.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Profile">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Name</Label><Input defaultValue={learnerProfile.name} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={learnerProfile.email} className="mt-1" /></div>
          </div>
          {/* TODO: connect to backend API */}
          <div className="flex justify-end"><Button className="gradient-ai text-white shadow-glow">Save Profile</Button></div>
        </Section>

        <Section title="Account & Security">
          <div><Label>Current Password</Label><Input type="password" className="mt-1" placeholder="••••••••" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>New Password</Label><Input type="password" className="mt-1" /></div>
            <div><Label>Confirm Password</Label><Input type="password" className="mt-1" /></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Two-factor authentication</div>
            <Switch />
          </div>
          <div className="flex justify-end"><Button variant="outline">Update Password</Button></div>
        </Section>

        <Section title="Notifications" description="Choose what we ping you about.">
          <ToggleRow label="New assignments" hint="When a tutor posts new work" checked={notif.newAssignments} onChange={(v) => setNotif({ ...notif, newAssignments: v })} />
          <ToggleRow label="Due-soon reminders" hint="24h before a deadline" checked={notif.dueSoonReminders} onChange={(v) => setNotif({ ...notif, dueSoonReminders: v })} />
          <ToggleRow label="Tutor replies" checked={notif.tutorReplies} onChange={(v) => setNotif({ ...notif, tutorReplies: v })} />
          <ToggleRow label="Weekly progress digest" checked={notif.weeklyProgress} onChange={(v) => setNotif({ ...notif, weeklyProgress: v })} />
          <ToggleRow label="Product updates" checked={notif.productUpdates} onChange={(v) => setNotif({ ...notif, productUpdates: v })} />
        </Section>

        <Section title="Learning Preferences" description="Tune how your AI tutor talks to you.">
          <div>
            <Label>Preferred explanation style</Label>
            <Select value={prefs.preferredStyle} onValueChange={(v) => setPrefs({ ...prefs, preferredStyle: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Conceptual", "Step-by-step", "Socratic", "Example-driven"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tone of voice</Label>
            <Select value={prefs.preferredTone} onValueChange={(v) => setPrefs({ ...prefs, preferredTone: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Friendly", "Formal", "Encouraging", "Neutral"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty (1 = Beginner, 5 = Advanced)</Label>
            <Slider
              className="mt-3"
              value={[prefs.difficulty]}
              min={1}
              max={5}
              step={1}
              onValueChange={(v) => setPrefs({ ...prefs, difficulty: v[0] })}
            />
            <div className="mt-1 text-xs text-muted-foreground">Currently: {prefs.difficulty}</div>
          </div>
          <div>
            <Label>Daily study goal (minutes)</Label>
            <Input
              type="number"
              value={prefs.dailyGoalMinutes}
              onChange={(e) => setPrefs({ ...prefs, dailyGoalMinutes: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <ToggleRow label="Voice replies from AI tutor" checked={prefs.voiceReplies} onChange={(v) => setPrefs({ ...prefs, voiceReplies: v })} />
          <ToggleRow label="Show AI suggestions in chat" checked={prefs.showAiSuggestions} onChange={(v) => setPrefs({ ...prefs, showAiSuggestions: v })} />
          {/* TODO: connect to backend API */}
          <div className="flex justify-end"><Button className="gradient-ai text-white shadow-glow">Save Preferences</Button></div>
        </Section>

        <Section title="Billing" description="Manage your subscription.">
          <div className="rounded-lg border border-border/60 bg-secondary/30 p-4">
            <div className="text-sm font-semibold">Free Plan</div>
            <div className="text-xs text-muted-foreground">3 AI sessions per day · Limited library</div>
          </div>
          {/* TODO: connect to payments */}
          <div className="flex justify-end"><Button className="gradient-ai text-white shadow-glow">Upgrade to Pro</Button></div>
        </Section>

        <Card className="border-rose-500/30 bg-rose-500/5 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Reset learning progress</div>
                <div className="text-xs text-muted-foreground">Clears your XP, streak, and mastery history.</div>
              </div>
              <Button variant="outline">Reset</Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Delete account</div>
                <div className="text-xs text-muted-foreground">This action cannot be undone.</div>
              </div>
              {/* TODO: connect to backend API */}
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
}
