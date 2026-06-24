import { createFileRoute, Link } from "@tanstack/react-router";
import { edCourses, edLearnerResults } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/")({
  component: LearnerDashboardPage,
});

function LearnerDashboardPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const courses = edCourses;
  const results = edLearnerResults as Array<Record<string, any>>;
  const latestScore = Number(results[0]?.score || results[0]?.averageScore || 82);

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Learner Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "مساحة المتعلم" : "Learner Space",
    title: isArabic ? "ابدأ تعلّمك الذكي" : "Start your smart learning journey",
    desc: isArabic
      ? "تابع كورساتك، اسأل التوأم الرقمي، حل الاختبارات، واعرف المواضيع التي تحتاج إلى تحسين."
      : "Track your courses, ask the Digital Twin, take quizzes, and discover the topics you need to improve.",

    joinedCourses: isArabic ? "كورسات منضم لها" : "Joined Courses",
    latestScore: isArabic ? "آخر نتيجة" : "Latest Score",
    weakTopics: isArabic ? "نقاط ضعف" : "Weak Topics",
    aiSessions: isArabic ? "جلسات ذكاء اصطناعي" : "AI Sessions",

    myCourses: isArabic ? "كورساتي" : "My Courses",
    myCoursesDesc: isArabic
      ? "الكورسات التي يمكنك الدراسة منها"
      : "Courses available for your learning",

    recentWeaknesses: isArabic ? "أحدث نقاط الضعف" : "Recent Weaknesses",
    recentWeaknessesDesc: isArabic
      ? "مواضيع تحتاج إلى مراجعة إضافية"
      : "Topics that need extra review",

    openCourse: isArabic ? "فتح الكورس" : "Open Course",
    askNow: isArabic ? "اسأل الآن" : "Ask now",
    startQuiz: isArabic ? "ابدأ اختبار" : "Start Quiz",
    learners: isArabic ? "متعلم" : "learners",
  };

  const topics =
    results.flatMap((result) => result.weakTopics || result.weaknesses || []).slice(0, 6);

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

          <Link to="/learner/ask" className="em-btn em-btn-primary">
            {t.askNow}
          </Link>
        </header>

        <section className="em-stat-grid">
          <article className="em-stat-card">
            <span>{t.joinedCourses}</span>
            <strong>{courses.length}</strong>
            <p>{isArabic ? "كورسات متاحة" : "available courses"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.latestScore}</span>
            <strong>{latestScore}%</strong>
            <p>{isArabic ? "آخر اختبار" : "latest quiz"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.weakTopics}</span>
            <strong>{topics.length || 4}</strong>
            <p>{isArabic ? "تحتاج مراجعة" : "need review"}</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>{t.aiSessions}</span>
            <strong>12</strong>
            <p>{isArabic ? "جلسات تعليمية" : "learning sessions"}</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.myCourses}</span>
                <h2>{t.myCoursesDesc}</h2>
              </div>
            </div>

            <div className="em-course-list">
              {courses.slice(0, 3).map((course) => (
                <article key={course.id} className="em-course-card">
                  <div className="em-card-topline">
                    <span>{course.subject}</span>
                    <small>{course.averageScore}%</small>
                  </div>

                  <h3>{course.name}</h3>
                  <p>{course.description}</p>

                  <div className="em-pill-row">
                    <span>{course.grade}</span>
                    <span>
                      {course.learners} {t.learners}
                    </span>
                  </div>

                  <div className="em-learner-actions">
                    <Link to="/learner/courses" className="em-btn em-btn-primary">
                      {t.openCourse}
                    </Link>

                    <Link to="/learner/quizzes" className="em-btn em-btn-soft">
                      {t.startQuiz}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.recentWeaknesses}</span>
                <h2>{t.recentWeaknessesDesc}</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              {(topics.length
                ? topics
                : isArabic
                  ? ["المفاهيم الأساسية", "حل المسائل", "التطبيق", "المراجعة"]
                  : ["Core concepts", "Problem solving", "Practice", "Revision"]
              ).map((topic, index) => (
                <span key={`${topic}-${index}`}>{topic}</span>
              ))}
            </div>

            <p className="em-builder-copy">
              {isArabic
                ? "يمكنك سؤال المدرّس الذكي عن هذه المواضيع للحصول على شرح أبسط وأمثلة إضافية."
                : "You can ask the AI Tutor about these topics to get simpler explanations and extra examples."}
            </p>

            <Link to="/learner/ask" className="em-btn em-btn-primary">
              {t.askNow}
            </Link>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}