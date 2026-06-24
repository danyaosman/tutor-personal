import { createFileRoute, Link } from "@tanstack/react-router";
import { edLearnerResults } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/weaknesses")({
  component: LearnerWeaknessesPage,
});

function LearnerWeaknessesPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const results = edLearnerResults as Array<Record<string, any>>;

  const topics =
    results.flatMap((result) => result.weakTopics || result.weaknesses || []).slice(0, 8);

  const latestScore = Number(results[0]?.score || results[0]?.averageScore || 72);

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "تحليل نقاط الضعف" : "Weakness Analysis",
    title: isArabic ? "راجع المواضيع التي تحتاج إلى تحسين" : "Review the topics you need to improve",
    desc: isArabic
      ? "تساعدك هذه الصفحة على معرفة المواضيع الضعيفة بعد الاختبارات، ثم الانتقال للمدرّس الذكي لطلب شرح إضافي."
      : "This page helps you see weak topics after quizzes, then move to the AI Tutor for extra explanation.",

    latestScore: isArabic ? "آخر نتيجة" : "Latest Score",
    weakTopics: isArabic ? "نقاط ضعف" : "Weak Topics",
    completedQuizzes: isArabic ? "اختبارات مكتملة" : "Completed Quizzes",
    aiHelp: isArabic ? "اقتراحات مساعدة" : "AI Help Suggestions",

    topicList: isArabic ? "قائمة المواضيع الضعيفة" : "Weak Topic List",
    topicDesc: isArabic
      ? "ابدأ بهذه المواضيع أولاً لأنها الأكثر حاجة للمراجعة"
      : "Start with these topics first because they need the most review",

    recommendation: isArabic ? "خطة مراجعة مقترحة" : "Suggested Review Plan",
    recommendationDesc: isArabic
      ? "اتبع هذه الخطوات لتحسين نتيجتك"
      : "Follow these steps to improve your score",

    askAboutTopic: isArabic ? "اسأل عن الموضوع" : "Ask about this topic",
    startQuiz: isArabic ? "ابدأ اختباراً جديداً" : "Start a new quiz",
    askAI: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
  };

  const fallbackTopics = isArabic
    ? ["المفاهيم الأساسية", "حل المسائل", "تطبيق القوانين", "المراجعة النهائية"]
    : ["Core concepts", "Problem solving", "Applying rules", "Final revision"];

  const displayedTopics = topics.length ? topics : fallbackTopics;

  const plan = isArabic
    ? [
        "ابدأ بمراجعة المفهوم الأساسي للموضوع.",
        "اطلب من المدرّس الذكي مثالاً بسيطاً.",
        "حل سؤالين أو ثلاثة على نفس الفكرة.",
        "أعد الاختبار لتقيس التحسن.",
      ]
    : [
        "Start by reviewing the core concept.",
        "Ask the AI Tutor for a simple example.",
        "Solve two or three questions on the same idea.",
        "Retake the quiz to measure improvement.",
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
            {t.askAI}
          </Link>
        </header>

        <section className="em-stat-grid">
          <article className="em-stat-card">
            <span>{t.latestScore}</span>
            <strong>{latestScore}%</strong>
            <p>{isArabic ? "آخر اختبار" : "latest quiz"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.weakTopics}</span>
            <strong>{displayedTopics.length}</strong>
            <p>{isArabic ? "تحتاج مراجعة" : "need review"}</p>
          </article>

          <article className="em-stat-card">
            <span>{t.completedQuizzes}</span>
            <strong>{results.length}</strong>
            <p>{isArabic ? "نتائج محفوظة" : "saved results"}</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>{t.aiHelp}</span>
            <strong>24/7</strong>
            <p>{isArabic ? "متاح دائماً" : "always available"}</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.topicList}</span>
                <h2>{t.topicDesc}</h2>
              </div>
            </div>

            <div className="em-result-list">
              {displayedTopics.map((topic, index) => (
                <article key={`${topic}-${index}`} className="em-result-card">
                  <div>
                    <h3>{topic}</h3>
                    <p>
                      {isArabic
                        ? "هذا الموضوع ظهر كمنطقة تحتاج إلى مراجعة إضافية."
                        : "This topic appeared as an area that needs extra review."}
                    </p>
                  </div>

                  <Link to="/learner/ask" className="em-btn em-btn-soft">
                    {t.askAboutTopic}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.recommendation}</span>
                <h2>{t.recommendationDesc}</h2>
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
              <Link to="/learner/ask" className="em-btn em-btn-primary">
                {t.askAI}
              </Link>

              <Link to="/learner/quizzes" className="em-btn em-btn-soft">
                {t.startQuiz}
              </Link>
            </div>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}