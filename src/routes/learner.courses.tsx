import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { edCourses } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/courses")({
  component: LearnerCoursesPage,
});

function LearnerCoursesPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();
  const [search, setSearch] = useState("");

  const filteredCourses = edCourses.filter((course) => {
    const courseText = `${course.name} ${course.subject} ${course.grade}`;
    return courseText.toLowerCase().includes(search.toLowerCase());
  });

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "كورسات المتعلم" : "Learner Courses",
    title: isArabic ? "اختر كورساً وابدأ الدراسة" : "Choose a course and start learning",
    desc: isArabic
      ? "استعرض الكورسات المتاحة، افتح المصادر، اسأل المدرّس الذكي، أو ابدأ اختباراً لقياس فهمك."
      : "Browse available courses, open resources, ask the AI Tutor, or start a quiz to measure your understanding.",

    search: isArabic ? "ابحث عن كورس..." : "Search courses...",
    available: isArabic ? "الكورسات المتاحة" : "Available Courses",
    availableDesc: isArabic
      ? "كل كورس مرتبط بتوأم رقمي ومصادر تعليمية"
      : "Each course is connected to a Digital Twin and learning resources",

    digitalTwin: isArabic ? "توأم رقمي جاهز" : "Digital Twin Ready",
    learners: isArabic ? "متعلم" : "learners",
    open: isArabic ? "فتح الكورس" : "Open Course",
    askNow: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quiz: isArabic ? "اختبار" : "Quiz",
  };

  return (
    <main className="em-app-page" dir={dir}>
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-app-shell">
        <nav className="em-app-nav">
          <Link to="/" className="em-app-logo">
            EduMind
          </Link>

          <div>
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link to="/learner">{t.dashboard}</Link>
            <Link to="/learner/courses">{t.courses}</Link>
            <Link to="/learner/ask">{t.ask}</Link>
            <Link to="/learner/quizzes">{t.quizzes}</Link>
            <Link to="/learner/weaknesses">{t.weaknesses}</Link>
            <Link to="/">{t.logout}</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-page-enter">
          <div>
            <span>{t.badge}</span>
            <h1>{t.title}</h1>
            <p>{t.desc}</p>
          </div>
        </header>

        <section className="em-panel em-course-library">
          <div className="em-panel-head em-search-head">
            <div>
              <span>{t.available}</span>
              <h2>{t.availableDesc}</h2>
            </div>

            <input
              className="em-search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
            />
          </div>

          <div className="em-library-grid">
            {filteredCourses.map((course) => (
              <article key={course.id} className="em-course-card em-library-card">
                <div className="em-card-topline">
                  <span>{course.subject}</span>
                  <small>{t.digitalTwin}</small>
                </div>

                <h3>{course.name}</h3>
                <p>{course.description}</p>

                <div className="em-pill-row">
                  <span>{course.grade}</span>
                  <span>
                    {course.learners} {t.learners}
                  </span>
                  <span>{course.averageScore}%</span>
                </div>

                <div className="em-learner-actions">
                  <Link to="/learner/ask" className="em-btn em-btn-primary">
                    {t.askNow}
                  </Link>

                  <Link to="/learner/quizzes" className="em-btn em-btn-soft">
                    {t.quiz}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}