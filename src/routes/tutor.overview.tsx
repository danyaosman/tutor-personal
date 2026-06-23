import { createFileRoute, Link } from "@tanstack/react-router";
import { edCourses, edLearnerResults } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/tutor/overview")({
  component: TutorOverviewPage,
});

function TutorOverviewPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const courses = edCourses;
  const results = edLearnerResults as Array<Record<string, any>>;

  const totalLearners = courses.reduce(
    (sum, course) => sum + Number(course.learners || 0),
    0
  );

  const averageScore = Math.round(
    courses.reduce((sum, course) => sum + Number(course.averageScore || 0), 0) /
      courses.length
  );

  const t = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    createCourse: isArabic ? "إنشاء توأم رقمي" : "Create Digital Twin",
    results: isArabic ? "تحليل الضعف" : "Weakness Analysis",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "مساحة المدرّس" : "Tutor Workspace",
    title: isArabic
      ? "تابع كورساتك وتقدّم المتعلمين"
      : "Track your courses and learner progress",
    desc: isArabic
      ? "من هذه اللوحة يمكنك متابعة الكورسات، التوأم الرقمي، نتائج الاختبارات، ونقاط الضعف لدى المتعلمين."
      : "From this dashboard, you can track courses, Digital Twins, quiz results, and learner weaknesses.",

    totalCourses: isArabic ? "عدد الكورسات" : "Total Courses",
    totalLearners: isArabic ? "عدد المتعلمين" : "Total Learners",
    avgScore: isArabic ? "متوسط النتائج" : "Average Score",
    activeTwins: isArabic ? "توائم رقمية فعّالة" : "Active Digital Twins",

    courseOverview: isArabic ? "نظرة على الكورسات" : "Course Overview",
    courseSubtitle: isArabic
      ? "الكورسات المرتبطة بالتوأم الرقمي"
      : "Courses connected to Digital Twins",

    latestResults: isArabic ? "آخر نتائج المتعلمين" : "Latest Learner Results",
    latestSubtitle: isArabic
      ? "نتائج حديثة يمكن استخدامها لتحليل نقاط الضعف"
      : "Recent results that can be used for weakness analysis",

    learners: isArabic ? "متعلم" : "learners",
    average: isArabic ? "متوسط" : "average",
    viewResults: isArabic ? "عرض التحليل" : "View Analysis",
    createNew: isArabic ? "إنشاء كورس جديد" : "Create New Course",
    weakTopics: isArabic ? "نقاط الضعف" : "Weak Topics",
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
            <Link to="/tutor/overview">{t.dashboard}</Link>
            <Link to="/tutor/digital-twin">{t.createCourse}</Link>
            <Link to="/tutor/weakness-analysis">{t.results}</Link>
            <Link to="/">{t.logout}</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-page-enter">
          <div>
            <span>{t.badge}</span>
            <h1>{t.title}</h1>
            <p>{t.desc}</p>
          </div>

          <Link to="/tutor/digital-twin" className="em-btn em-btn-primary">
            + {t.createNew}
          </Link>
        </header>

        <section className="em-stat-grid">
          <article className="em-stat-card">
            <span>{t.totalCourses}</span>
            <strong>{courses.length}</strong>
            <p>{isArabic ? "كورسات منشأة" : "created courses"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.totalLearners}</span>
            <strong>{totalLearners}</strong>
            <p>{isArabic ? "متعلم مسجّل" : "registered learners"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.avgScore}</span>
            <strong>{averageScore}%</strong>
            <p>{isArabic ? "متوسط عام" : "overall average"}</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>{t.activeTwins}</span>
            <strong>{courses.length}</strong>
            <p>{isArabic ? "جاهزة للعمل" : "ready to use"}</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.courseOverview}</span>
                <h2>{t.courseSubtitle}</h2>
              </div>
            </div>

            <div className="em-course-list">
              {courses.map((course) => (
                <article key={course.id} className="em-course-card">
                  <div className="em-card-topline">
                    <span>{course.subject}</span>
                    <small>
                      {course.averageScore}% {t.average}
                    </small>
                  </div>

                  <h3>{course.name}</h3>
                  <p>{course.description}</p>

                  <div className="em-pill-row">
                    <span>{course.grade}</span>
                    <span>
                      {course.learners} {t.learners}
                    </span>
                    <span>{isArabic ? "توأم رقمي جاهز" : "Digital Twin Ready"}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.latestResults}</span>
                <h2>{t.latestSubtitle}</h2>
              </div>
            </div>

            <div className="em-result-list">
              {results.slice(0, 4).map((result, index) => (
                <article key={index} className="em-result-card">
                  <div>
                    <h3>
                      {result.learnerName ||
                        result.name ||
                        (isArabic ? "متعلم" : "Learner")}
                    </h3>

                    <p>
                      {result.courseName ||
                        result.course ||
                        (isArabic ? "كورس تعليمي" : "Learning course")}
                    </p>
                  </div>

                  <strong>{result.score || result.averageScore || 76}%</strong>
                </article>
              ))}
            </div>

            <Link to="/tutor/weakness-analysis" className="em-btn em-btn-primary">
              {t.viewResults}
            </Link>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}