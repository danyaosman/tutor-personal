import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { useRequireRole } from "@/hooks/use-require-role";
import { currentUserQueryKey, useCurrentUser } from "@/hooks/use-current-user";
import { clearSession } from "@/lib/api";
import { EduFooter, LanguageToggle, useEduLang } from "@/lib/edumindUi";

export function LearnerLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { isAuthorized } = useRequireRole("student");
  const { lang, setLang, dir } = useEduLang();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const dashboardPath = user?.role === "student" ? "/learner/courses" : "/login";
  const navItems = [
    { to: "/learner/courses", label: "Courses" },
    { to: "/learner/quizzes", label: "Quizzes" },
    { to: "/learner/flashcards", label: "Flashcards" },
    { to: "/learner/progress", label: "Progress" },
    { to: "/learner/settings", label: "Settings" },
  ] as const;

  if (!isAuthorized) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="em-app-page" dir={dir}>
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />
      <section className="em-app-shell">
        <nav className="em-app-nav">
          <Link to={dashboardPath} className="em-app-logo">
            EduMind
          </Link>
          <div>
            <LanguageToggle lang={lang} setLang={setLang} />
            {navItems.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link key={item.to} to={item.to} className={active ? "is-active" : ""}>
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              onClick={() => {
                clearSession();
                queryClient.removeQueries({ queryKey: currentUserQueryKey });
              }}
            >
              Logout
            </Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-page-enter">
          <div>
            <span>
              {user?.username ? `Student workspace - ${user.username}` : "Student workspace"}
            </span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="em-hero-actions">{actions}</div>}
        </header>

        <main className="em-content-surface">
          <div className="hidden">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
