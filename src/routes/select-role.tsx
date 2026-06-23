import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  EduFooter,
  LanguageToggle,
  PageLoader,
  useEduLang,
} from "../lib/edumindUi";

export const Route = createFileRoute("/select-role")({
  component: SelectRolePage,
});

function SelectRolePage() {
  const navigate = useNavigate();
  const { lang, setLang, dir, isArabic } = useEduLang();
  const [loading, setLoading] = useState(false);

  function goRegister(role: "tutor" | "learner") {
    setLoading(true);

    setTimeout(() => {
      navigate({
        to: "/register",
        search: { role },
      });
    }, 650);
  }

  const text = {
    login: isArabic ? "تسجيل الدخول" : "Login",
    eyebrow: isArabic ? "اختر مساحتك" : "Choose your space",
    title: isArabic
      ? "كيف تريد استخدام EduMind؟"
      : "How do you want to use EduMind?",
    desc: isArabic
      ? "اختر دورك لتبدأ الرحلة المناسبة. المدرّس ينشئ توأمه الرقمي، والمتعلم ينضم للكورسات ويتطور بمساعدة الذكاء الاصطناعي."
      : "Select your role to start the right learning journey. Tutors build Digital Twins, while learners join courses and improve with AI help.",
    tutorWorkspace: isArabic ? "مساحة المدرّس" : "Tutor Workspace",
    tutorTitle: isArabic ? "أنشئ توأمك الرقمي" : "Create your Digital Twin",
    tutorDesc: isArabic
      ? "ارفع المصادر، أضف تعليمات الشرح، أنشئ الكورسات، وتابع نقاط ضعف المتعلمين."
      : "Upload resources, add teaching instructions, create courses, and track learners’ weak topics.",
    tutorContinue: isArabic ? "المتابعة كمدرّس ←" : "Continue as Tutor →",
    learnerSpace: isArabic ? "مساحة المتعلم" : "Learner Space",
    learnerTitle: isArabic ? "تعلّم بدعم ذكي" : "Learn with AI support",
    learnerDesc: isArabic
      ? "انضم للكورسات، اسأل المدرّس الذكي، حل الاختبارات، واعرف ماذا تحتاج أن تحسّن."
      : "Join courses, ask the AI Tutor questions, take quizzes, and discover what to improve.",
    learnerContinue: isArabic ? "المتابعة كمتعلم ←" : "Continue as Learner →",
  };

  return (
    <main className="em-auth-page" dir={dir}>
      {loading && <PageLoader />}

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
              {text.login}
            </Link>
          </div>
        </nav>

        <div className="em-role-heading em-page-enter">
          <span>{text.eyebrow}</span>

          <h1>{text.title}</h1>

          <p>{text.desc}</p>
        </div>

        <div className="em-role-select-grid">
          <button
            type="button"
            onClick={() => goRegister("tutor")}
            className="em-choice-card em-choice-tutor em-choice-button"
          >
            <div className="em-choice-icon">T</div>

            <div>
              <span>{text.tutorWorkspace}</span>
              <h2>{text.tutorTitle}</h2>
              <p>{text.tutorDesc}</p>
            </div>

            <strong>{text.tutorContinue}</strong>
          </button>

          <button
            type="button"
            onClick={() => goRegister("learner")}
            className="em-choice-card em-choice-learner em-choice-button"
          >
            <div className="em-choice-icon">L</div>

            <div>
              <span>{text.learnerSpace}</span>
              <h2>{text.learnerTitle}</h2>
              <p>{text.learnerDesc}</p>
            </div>

            <strong>{text.learnerContinue}</strong>
          </button>
        </div>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}