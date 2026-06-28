import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { EduFooter, LanguageToggle, useEduLang } from "@/lib/edumindUi";
import { gradeLevels } from "@/lib/grades";

type RegisterSearch = {
  role?: UserRole;
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    role: search.role === "teacher" || search.role === "student" ? search.role : undefined,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { lang, setLang, dir } = useEduLang();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<UserRole>(search.role ?? "student");

  return (
    <main className="em-auth-page" dir={dir}>
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-auth-shell">
        <nav className="em-auth-nav">
          <Link to="/" className="em-auth-logo">
            EduMind
          </Link>
          <div className="em-auth-nav-actions">
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link to="/login" className="em-auth-nav-link">
              Login
            </Link>
          </div>
        </nav>

        <div className="em-form-layout">
          <div className="em-form-intro em-role-copy" key={role}>
            <span>{role === "teacher" ? "Teacher account" : "Student account"}</span>
            <h1>
              {role === "teacher" ? "Build your teaching twin." : "Start learning smarter."}
            </h1>
            <p>
              {role === "teacher"
                ? "Create courses, upload PDFs, add teaching instructions, and follow student progress from one clean dashboard."
                : "Join courses, chat with your teacher's Digital Twin, take quizzes, and understand your weak topics faster."}
            </p>
            <div className="edu-simple-role-switch">
              <button
                type="button"
                className={role === "teacher" ? "active" : ""}
                onClick={() => setRole("teacher")}
              >
                Teacher
              </button>
              <button
                type="button"
                className={role === "student" ? "active" : ""}
                onClick={() => setRole("student")}
              >
                Student
              </button>
            </div>
          </div>

      <form
        className="em-form-card"
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
        <div className="em-form-header em-role-copy" key={`${role}-header`}>
          <span>Create account</span>
          <h2>{role === "teacher" ? "I am a Teacher" : "I am a Student"}</h2>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="em-input-grid">
          <div>
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" autoComplete="given-name" required />
          </div>
          <div>
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" autoComplete="family-name" required />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="maya.chen"
              required
            />
          </div>
          <div>
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
          <div>
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
          <div>
            <Label>I am a</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {role === "student" && (
          <div className="mt-4">
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
          className="em-btn em-btn-primary em-full-btn mt-5 text-white"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
        <p className="em-form-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
        </div>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
