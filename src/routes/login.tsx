import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/tutor/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import { getRoleHome, login } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue building your AI teaching twin."
      footer={<>Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSubmitting(true);
          const form = new FormData(event.currentTarget);
          try {
            const user = await login(String(form.get("username")), String(form.get("password")));
            queryClient.setQueryData(currentUserQueryKey, user);
            await navigate({ to: getRoleHome(user.role) });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to sign in.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" autoComplete="username" placeholder="maya.chen" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full gradient-ai text-white shadow-glow hover:opacity-90">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
