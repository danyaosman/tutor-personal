import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import { getProfile, updateProfile, type UpdateProfileInput, type UserProfile } from "@/lib/api";

export const Route = createFileRoute("/tutor/settings")({
  head: () => ({ meta: [{ title: "Tutor Settings - AI Tutor" }] }),
  component: TutorSettingsPage,
});

function TutorSettingsPage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: getProfile,
  });
  const updateMutation = useMutation<UserProfile, Error, UpdateProfileInput>({
    mutationFn: updateProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(["auth", "profile"], profile);
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
  const profile = profileQuery.data;

  return (
    <TutorLayout
      title="Settings"
      subtitle="Update your tutor profile and the guidance used for your teaching twin."
    >
      {profileQuery.isPending && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading profile...
        </Card>
      )}

      {profileQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>{profileQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {profile && (
        <Card className="max-w-3xl shadow-soft">
          <CardHeader>
            <CardTitle>Tutor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                try {
                  await updateMutation.mutateAsync({
                    first_name: String(form.get("first_name") ?? ""),
                    last_name: String(form.get("last_name") ?? ""),
                    email: String(form.get("email") ?? ""),
                    phone: String(form.get("phone") ?? ""),
                    bio: String(form.get("bio") ?? ""),
                    teaching_style_summary: String(form.get("teaching_style_summary") ?? ""),
                    ai_instructions: String(form.get("ai_instructions") ?? ""),
                  });
                } catch {
                  // React Query exposes the request error below.
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" name="first_name" defaultValue={profile.first_name} />
                <Field label="Last Name" name="last_name" defaultValue={profile.last_name} />
                <Field label="Email" name="email" type="email" defaultValue={profile.email} />
                <Field label="Phone" name="phone" defaultValue={profile.phone} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teaching_style_summary">Teaching Style Summary</Label>
                <Textarea
                  id="teaching_style_summary"
                  name="teaching_style_summary"
                  rows={3}
                  defaultValue={profile.teaching_style_summary ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ai_instructions">AI Instructions</Label>
                <Textarea
                  id="ai_instructions"
                  name="ai_instructions"
                  rows={4}
                  defaultValue={profile.ai_instructions ?? ""}
                />
              </div>

              {updateMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>{updateMutation.error.message}</AlertDescription>
                </Alert>
              )}

              {updateMutation.isSuccess && (
                <Alert>
                  <AlertDescription>Profile saved.</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gradient-ai text-white"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </TutorLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
