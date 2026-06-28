import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getRoleHome, hasSession } from "@/lib/api";
import { EduFooter, LanguageToggle, PageLoader, useEduLang } from "@/lib/edumindUi";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { lang, setLang, dir } = useEduLang();
  const [loading, setLoading] = useState(false);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (hasSession() && currentUser.data) {
      void navigate({ to: getRoleHome(currentUser.data.role), replace: true });
    }
  }, [currentUser.data, navigate]);

  function go(to: "/login" | "/select-role" | "/register", role?: "teacher" | "student") {
    setLoading(true);
    window.setTimeout(() => {
      if (role) {
        void navigate({ to, search: { role } });
        return;
      }
      void navigate({ to });
    }, 350);
  }

  const steps = [
    {
      number: "01",
      title: "Teacher creates a course",
      desc: "Course information, grade, description, goals, and resources stay connected to the backend.",
    },
    {
      number: "02",
      title: "Uploads resources",
      desc: "PDF files become searchable course knowledge for student questions.",
    },
    {
      number: "03",
      title: "Digital Twin teaches",
      desc: "The AI answers using course material and teacher guidance.",
    },
    {
      number: "04",
      title: "Practice finds gaps",
      desc: "Quizzes, flashcards, and progress views help students review weak topics.",
    },
  ];

  const flowItems = ["Upload PDF", "Add teaching style", "AI Tutor teaches", "Weak topics appear"];

  return (
    <main className="em-landing" dir={dir}>
      {loading && <PageLoader />}
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-shell">
        <nav className="em-nav">
          <h2>EduMind</h2>
          <div>
            <LanguageToggle lang={lang} setLang={setLang} />
            <button type="button" onClick={() => go("/login")}>
              Login
            </button>
            <button type="button" className="em-nav-cta" onClick={() => go("/select-role")}>
              Get Started
            </button>
          </div>
        </nav>

        <section className="em-hero em-page-enter">
          <div className="em-hero-copy">
            <span className="em-eyebrow">AI Tutor - Digital Twin Learning</span>
            <h1>
              Learn from a teacher's
              <br />
              <span>Digital Twin</span>
            </h1>
            <p>
              EduMind helps teachers turn course resources and teaching style into an AI
              learning experience. Students can ask questions, take quizzes, and review the
              topics they need to improve.
            </p>
            <div className="em-hero-actions">
              <button type="button" className="em-btn em-btn-primary" onClick={() => go("/register", "teacher")}>
                Join as Teacher
              </button>
              <button type="button" className="em-btn em-btn-soft" onClick={() => go("/register", "student")}>
                Join as Student
              </button>
            </div>
          </div>

          <div className="em-visual-card">
            <div className="em-card-header">
              <span />
              <span />
              <span />
            </div>
            <div className="em-twin-badge">Digital Twin Ready</div>
            <div className="em-flow-line">
              {flowItems.map((item, index) => (
                <div key={item}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="em-section">
          <div className="em-section-title">
            <span>How it works</span>
            <h2>One course becomes a personalized AI learning space</h2>
          </div>
          <div className="em-steps">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="em-roles">
          <div className="em-role em-role-tutor">
            <div>
              <span>Teacher</span>
              <h3>Build your teaching twin</h3>
              <p>Create courses, upload PDFs, add teaching instructions, and follow student progress.</p>
            </div>
            <button type="button" className="em-btn em-btn-light" onClick={() => go("/register", "teacher")}>
              Join as Teacher
            </button>
          </div>
          <div className="em-role em-role-learner">
            <div>
              <span>Student</span>
              <h3>Learn with AI support</h3>
              <p>Join courses, ask the AI Tutor questions, take quizzes, and improve weak topics.</p>
            </div>
            <button type="button" className="em-btn em-btn-soft" onClick={() => go("/register", "student")}>
              Join as Student
            </button>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
