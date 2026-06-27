import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/tutor/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import { getRoleHome, login, register, type UserRole } from "@/lib/api";
import { gradeLevels } from "@/lib/grades";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<UserRole>("student");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning or training your AI teaching twin in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSubmitting(true);
          const form = new FormData(event.currentTarget);
          const username = String(form.get("username"));
          const password = String(form.get("password"));
          try {
            await register({
              username,
              email: String(form.get("email")),
              password,
              first_name: String(form.get("first_name")),
              last_name: String(form.get("last_name")),
              role,
              ...(role === "student" ? { grade_level: String(form.get("grade_level")) } : {}),
            });
            const user = await login(username, password);
            queryClient.setQueryData(currentUserQueryKey, user);
            await navigate({ to: getRoleHome(user.role) });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create your account.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" autoComplete="given-name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" autoComplete="family-name" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="maya.chen"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>I am a</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Learner</SelectItem>
              <SelectItem value="teacher">Tutor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {role === "student" && (
          <div className="space-y-1.5">
            <Label>Grade Level</Label>
            <Select name="grade_level" defaultValue="10">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-ai text-white shadow-glow hover:opacity-90"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
