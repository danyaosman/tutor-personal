import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { tutorProfile, notificationDefaults, aiPreferenceDefaults } from "@/data/mockData";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/tutor/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Tutor" }] }),
  component: SettingsPage,
});

function ToggleRow({
  label, description, defaultChecked,
}: { label: string; description: string; defaultChecked: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      {/* TODO: connect to backend API */}
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

function SettingsPage() {
  return (
    <TutorLayout title="Settings" subtitle="Account, notifications, and AI preferences.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full gradient-ai text-lg font-bold text-white shadow-glow">
                  {tutorProfile.avatarInitials}
                </div>
                {/* TODO: connect to file storage */}
                <Button variant="outline">Change photo</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Full name</Label><Input defaultValue={tutorProfile.name} /></div>
                <div><Label>Email</Label><Input defaultValue={tutorProfile.email} /></div>
                <div className="sm:col-span-2"><Label>Subject expertise</Label><Input defaultValue={tutorProfile.subject} /></div>
                <div className="sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea rows={3} defaultValue="CS educator and researcher focused on accessible ML learning." />
                </div>
              </div>
              {/* TODO: connect to backend API */}
              <div className="flex justify-end"><Button className="gradient-ai text-white">Save changes</Button></div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <ToggleRow label="Student submissions" description="Notify when a student submits an assignment or quiz." defaultChecked={notificationDefaults.studentSubmissions} />
              <ToggleRow label="New requests" description="Get pinged when a student asks for help." defaultChecked={notificationDefaults.newRequests} />
              <ToggleRow label="Weekly summary" description="A digest of class activity every Monday." defaultChecked={notificationDefaults.weeklyReport} />
              <ToggleRow label="Product updates" description="Release notes and new feature announcements." defaultChecked={notificationDefaults.productUpdates} />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle>AI Preferences</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              <ToggleRow label="Auto-grade short answers" description="Use the AI to draft scores for free-text responses." defaultChecked={aiPreferenceDefaults.autoGradeShortAnswer} />
              <ToggleRow label="Suggest replies to requests" description="Generate reply drafts in the Requests inbox." defaultChecked={aiPreferenceDefaults.suggestReplies} />
              <ToggleRow label="Weekly insights" description="Spot trends and at-risk students automatically." defaultChecked={aiPreferenceDefaults.weeklyInsights} />
              <ToggleRow label="Share anonymized data" description="Help improve the platform with anonymous usage data." defaultChecked={aiPreferenceDefaults.shareAnonData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Account & Security</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* TODO: connect to auth */}
              <Button variant="outline" className="w-full">Change password</Button>
              <Button variant="outline" className="w-full">Enable 2FA</Button>
              <Button variant="outline" className="w-full">Manage sessions</Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Current plan</div>
                <div className="mt-0.5 font-semibold">Educator Pro</div>
              </div>
              {/* TODO: connect to billing provider */}
              <Button variant="outline" className="w-full">Manage subscription</Button>
            </CardContent>
          </Card>

          <Card className="border-rose-500/30 shadow-soft">
            <CardHeader><CardTitle className="text-rose-600">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
              <Separator />
              {/* TODO: connect to backend API */}
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4" /> Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}
