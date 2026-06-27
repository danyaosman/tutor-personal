import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import { getProfile, updateProfile, type UpdateProfileInput, type UserProfile } from "@/lib/api";

export const Route = createFileRoute("/learner/settings")({
  head: () => ({ meta: [{ title: "Learner Settings - AI Tutor" }] }),
  component: LearnerSettingsPage,
});

function LearnerSettingsPage() {
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
    <LearnerLayout
      title="Settings"
      subtitle="Keep your learner profile current for course recommendations and progress reporting."
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
            <CardTitle>Learner Profile</CardTitle>
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
                    grade_level: String(form.get("grade_level") ?? ""),
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
                <Field
                  label="Grade Level"
                  name="grade_level"
                  defaultValue={profile.grade_level ?? ""}
                />
              </div>

              {profile.weakness_summary && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Current Weakness Summary
                  </div>
                  <p className="mt-1 text-sm">{profile.weakness_summary}</p>
                </div>
              )}

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
    </LearnerLayout>
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
