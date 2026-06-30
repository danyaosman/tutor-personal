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
      ? "بطاقات مرتبة لكل متعلم مع النتيجة والمواضيع التي تحتاج متابعة"
      : "Organized cards for each learner with score and weak topics",

    learner: isArabic ? "المتعلم" : "Learner",
    course: isArabic ? "الكورس" : "Course",
    score: isArabic ? "النتيجة" : "Score",
    good: isArabic ? "جيد" : "Good",
    support: isArabic ? "يحتاج دعم" : "Needs support",
    review: isArabic ? "مراجعة مع المتعلم" : "Review with learner",

    commonWeaknesses: isArabic ? "أكثر المواضيع ضعفاً" : "Most Common Weaknesses",
    commonDesc: isArabic
      ? "مواضيع تكررت في نتائج المتعلمين"
      : "Topics repeated across learner results",
    actionPlan: isArabic ? "خطة متابعة سريعة" : "Quick Follow-up Plan",
    actionDesc: isArabic
      ? "خطوات تساعد المدرّس على تحسين النتائج"
      : "Steps that help the tutor improve results",
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

  const allTopics = results.flatMap(
    (result) => result.weakTopics || result.weaknesses || []
  );

  const topicCounts = allTopics.reduce<Record<string, number>>((counts, topic) => {
    counts[topic] = (counts[topic] || 0) + 1;
    return counts;
  }, {});

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const fallbackTopics = isArabic
    ? ["حل المسائل", "المفاهيم الأساسية", "التحليل", "التطبيق العملي"]
    : ["Problem solving", "Core concepts", "Analysis", "Practical practice"];

  const plan = isArabic
    ? [
        "ابدأ بالمتعلمين أصحاب النتائج الأقل من 70%.",
        "راجع أكثر موضوع متكرر في نقاط الضعف.",
        "أضف مثالاً عملياً أو شرحاً مختصراً داخل التوأم الرقمي.",
        "اطلب من المتعلمين إعادة اختبار قصير بعد المراجعة.",
      ]
    : [
        "Start with learners scoring below 70%.",
        "Review the most repeated weak topic.",
        "Add a practical example or short explanation inside the Digital Twin.",
        "Ask learners to retake a short quiz after review.",
      ];

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
            <strong>{allTopics.length || fallbackTopics.length}</strong>
            <p>{isArabic ? "موضوع يحتاج مراجعة" : "topics to review"}</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>{t.needsSupport}</span>
            <strong>{weakResults.length}</strong>
            <p>{isArabic ? "متعلمين بحاجة لمتابعة" : "learners need follow-up"}</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.learnerResults}</span>
                <h2>{t.learnerResultsDesc}</h2>
              </div>
            </div>

            <div className="em-course-list">
              {results.map((result, index) => {
                const score = Number(result.score || result.averageScore || 76);
                const learnerName =
                  result.learnerName || result.name || (isArabic ? "متعلم" : "Learner");
                const courseName =
                  result.courseName || result.course || (isArabic ? "كورس تعليمي" : "Course");
                const weakTopics = result.weakTopics || result.weaknesses || [];
                const needsSupport = score < 70;

                return (
                  <article key={`${learnerName}-${index}`} className="em-course-card">
                    <div className="em-card-topline">
                      <span>{t.learner}</span>
                      <small
                        style={{
                          color: "white",
                          background: needsSupport ? "#ff8600" : "#22c55e",
                        }}
                      >
                        {score}% • {needsSupport ? t.support : t.good}
                      </small>
                    </div>

                    <h3>{learnerName}</h3>
                    <p>
                      <strong>{t.course}: </strong>
                      {courseName}
                    </p>

                    <div className="em-pill-row">
                      {(weakTopics.length ? weakTopics : fallbackTopics.slice(0, 2)).map(
                        (topic: string) => (
                          <span key={`${learnerName}-${topic}`}>{topic}</span>
                        )
                      )}
                    </div>

                    <div className="em-learner-actions">
                      <Link to="/tutor/digital-twin" className="em-btn em-btn-soft">
                        {t.review}
                      </Link>
                    </div>
                  </article>
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
              {(sortedTopics.length
                ? sortedTopics
                : fallbackTopics.map((topic) => [topic, 1] as [string, number])
              ).map(([topic, count]) => (
                <span key={topic}>
                  {topic} {count > 1 ? `×${count}` : ""}
                </span>
              ))}
            </div>

            <div className="em-panel-head em-space-top">
              <div>
                <span>{t.actionPlan}</span>
                <h2>{t.actionDesc}</h2>
              </div>
            </div>

            <div className="em-course-list">
              {plan.map((step, index) => (
                <article key={step} className="em-course-card">
                  <div className="em-card-topline">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{step}</h3>
                </article>
              ))}
            </div>

            <div className="em-learner-actions">
              <Link to="/tutor/digital-twin" className="em-btn em-btn-primary">
                {t.review}
              </Link>
            </div>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
