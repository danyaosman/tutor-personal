import { createFileRoute, Link } from "@tanstack/react-router";
import { edLearnerResults } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/tutor/weakness-analysis")({
  component: TutorWeaknessAnalysisPage,
});

function TutorWeaknessAnalysisPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const results = edLearnerResults as Array<Record<string, any>>;

  const t = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    createCourse: isArabic ? "إنشاء توأم رقمي" : "Create Digital Twin",
    results: isArabic ? "تحليل الضعف" : "Weakness Analysis",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "تحليل نقاط الضعف" : "Weakness Analysis",
    title: isArabic
      ? "اعرف أين يحتاج المتعلمون إلى دعم أكثر"
      : "Discover where learners need more support",
    desc: isArabic
      ? "تعرض هذه الصفحة نتائج الاختبارات، المواضيع الضعيفة، والمتعلمين الذين يحتاجون إلى متابعة إضافية."
      : "This page shows quiz results, weak topics, and learners who need extra support.",

    totalResults: isArabic ? "عدد النتائج" : "Total Results",
    averageScore: isArabic ? "متوسط النتائج" : "Average Score",
    weakTopics: isArabic ? "مواضيع ضعيفة" : "Weak Topics",
    needsSupport: isArabic ? "بحاجة لدعم" : "Need Support",

    learnerResults: isArabic ? "نتائج المتعلمين" : "Learner Results",
    learnerResultsDesc: isArabic
      ? "آخر نتائج الاختبارات وتحليل المواضيع الضعيفة"
      : "Latest quiz results and weak topic analysis",

    learner: isArabic ? "المتعلم" : "Learner",
    course: isArabic ? "الكورس" : "Course",
    score: isArabic ? "النتيجة" : "Score",
    topic: isArabic ? "نقاط الضعف" : "Weaknesses",
    status: isArabic ? "الحالة" : "Status",

    good: isArabic ? "جيد" : "Good",
    support: isArabic ? "يحتاج دعم" : "Needs support",
    review: isArabic ? "مراجعة مع المتعلم" : "Review with learner",

    commonWeaknesses: isArabic ? "أكثر المواضيع ضعفاً" : "Most Common Weaknesses",
    commonDesc: isArabic
      ? "مواضيع متكررة في نتائج المتعلمين"
      : "Topics repeated across learner results",
  };

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, result) => sum + Number(result.score || result.averageScore || 0),
            0
          ) / results.length
        )
      : 0;

  const weakResults = results.filter(
    (result) => Number(result.score || result.averageScore || 0) < 70
  );

  const topics = results
    .flatMap((result) => result.weakTopics || result.weaknesses || [])
    .slice(0, 8);

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
        </header>

        <section className="em-stat-grid">
          <article className="em-stat-card">
            <span>{t.totalResults}</span>
            <strong>{results.length}</strong>
            <p>{isArabic ? "نتائج محفوظة" : "saved results"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.averageScore}</span>
            <strong>{averageScore}%</strong>
            <p>{isArabic ? "متوسط عام" : "overall average"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.weakTopics}</span>
            <strong>{topics.length || 6}</strong>
            <p>{isArabic ? "موضوع يحتاج مراجعة" : "topics to review"}</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>{t.needsSupport}</span>
            <strong>{weakResults.length}</strong>
            <p>{isArabic ? "متعلمين بحاجة لمتابعة" : "learners need follow-up"}</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel em-table-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.learnerResults}</span>
                <h2>{t.learnerResultsDesc}</h2>
              </div>
            </div>

            <div className="em-results-table">
              <div className="em-table-row em-table-heading">
                <span>{t.learner}</span>
                <span>{t.course}</span>
                <span>{t.score}</span>
                <span>{t.status}</span>
              </div>

              {results.map((result, index) => {
                const score = Number(result.score || result.averageScore || 76);
                const learnerName =
                  result.learnerName || result.name || (isArabic ? "متعلم" : "Learner");
                const courseName =
                  result.courseName || result.course || (isArabic ? "كورس تعليمي" : "Course");

                return (
                  <div key={index} className="em-table-row">
                    <span>{learnerName}</span>
                    <span>{courseName}</span>
                    <span>{score}%</span>
                    <span className={score < 70 ? "em-danger-pill" : "em-success-pill"}>
                      {score < 70 ? t.support : t.good}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.commonWeaknesses}</span>
                <h2>{t.commonDesc}</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              {(topics.length
                ? topics
                : isArabic
                  ? ["حل المسائل", "المفاهيم الأساسية", "التحليل", "التطبيق العملي"]
                  : ["Problem solving", "Core concepts", "Analysis", "Practical practice"]
              ).map((topic, index) => (
                <span key={`${topic}-${index}`}>{topic}</span>
              ))}
            </div>

            <p className="em-builder-copy">
              {isArabic
                ? "يمكن للمدرّس استخدام هذه المعلومات لتعديل طريقة الشرح أو إضافة أمثلة إضافية داخل التوأم الرقمي."
                : "The tutor can use this information to adjust teaching instructions or add more examples inside the Digital Twin."}
            </p>

            <Link to="/tutor/digital-twin" className="em-btn em-btn-primary">
              {t.review}
            </Link>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}