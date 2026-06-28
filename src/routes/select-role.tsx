import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, GraduationCap } from "lucide-react";
import { EduFooter, LanguageToggle, useEduLang } from "@/lib/edumindUi";

export const Route = createFileRoute("/select-role")({
  component: SelectRole,
});

function SelectRole() {
  const { lang, setLang, dir } = useEduLang();

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

        <header className="em-dashboard-hero em-page-enter">
          <div>
            <span>Choose your workspace</span>
            <h1>How will you use EduMind?</h1>
            <p>Choose the backend-supported role for the demo flow: teacher or student.</p>
          </div>
        </header>

        <section className="em-roles">
          <RoleCard
            to="/register"
            search={{ role: "teacher" }}
            icon={<GraduationCap className="h-7 w-7" />}
            badge="Teacher"
            title="Build courses and Digital Twins"
            description="Create courses, upload PDFs, tune teaching guidance, and inspect student progress."
            cta="Create teacher account"
          />
          <RoleCard
            to="/register"
            search={{ role: "student" }}
            icon={<BookOpenCheck className="h-7 w-7" />}
            badge="Student"
            title="Learn with AI support"
            description="Enroll in courses, ask the AI tutor, take quizzes, and review flashcards."
            cta="Create student account"
          />
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}

function RoleCard({
  to,
  search,
  icon,
  badge,
  title,
  description,
  cta,
}: {
  to: "/register";
  search: { role: "teacher" | "student" };
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link to={to} search={search} className="em-role em-role-learner">
      <div>
        <span>{badge}</span>
        <div className="mt-4 grid h-14 w-14 place-items-center rounded-lg gradient-ai text-white shadow-glow">
          {icon}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-primary">
          {cta} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
