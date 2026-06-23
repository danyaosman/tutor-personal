import { Link } from "@tanstack/react-router";
import {
  EduFooter,
  LanguageToggle,
  useEduLang,
} from "./edumindUi";

type PlaceholderPageProps = {
  role: "learner" | "tutor";
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

export function PlaceholderPage({
  role,
  badgeAr,
  badgeEn,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
}: PlaceholderPageProps) {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const dashboardLink = role === "learner" ? "/learner" : "/tutor/overview";

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

            {role === "learner" ? (
              <>
                <Link to="/learner">Dashboard</Link>
                <Link to="/learner/courses">Courses</Link>
                <Link to="/learner/ask">Ask AI</Link>
                <Link to="/learner/quizzes">Quiz</Link>
              </>
            ) : (
              <>
                <Link to="/tutor/overview">Dashboard</Link>
                <Link to="/tutor/digital-twin">Create Course</Link>
                <Link to="/tutor/weakness-analysis">Results</Link>
              </>
            )}

            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-page-enter">
          <div>
            <span>{isArabic ? badgeAr : badgeEn}</span>

            <h1>{isArabic ? titleAr : titleEn}</h1>

            <p>{isArabic ? descriptionAr : descriptionEn}</p>
          </div>

          <Link to={dashboardLink} className="em-btn em-btn-primary">
            {isArabic ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
        </header>

        <section className="em-panel">
          <div className="em-panel-head">
            <div>
              <span>{isArabic ? "قيد التطوير" : "Coming Soon"}</span>

              <h2>
                {isArabic
                  ? "هذه الصفحة ليست ضمن المسار الأساسي حالياً"
                  : "This page is not part of the core flow yet"}
              </h2>
            </div>
          </div>

          <p className="em-builder-copy">
            {isArabic
              ? "تم ترك هذه الصفحة بتصميم موحّد حتى لا يظهر أي جزء قديم من المشروع. يمكن لاحقاً تطويرها وإضافة محتوى حقيقي حسب احتياجات المنصة."
              : "This page is kept with a unified design so no old template UI appears. It can be expanded later with real content based on the platform needs."}
          </p>

          <div className="em-topic-cloud">
            <span>XXXXX</span>
            <span>XXXXX</span>
            <span>XXXXX</span>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}