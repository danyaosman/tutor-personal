import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  EduFooter,
  LanguageToggle,
  PageLoader,
  useEduLang,
} from "../lib/edumindUi";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { lang, setLang, dir, isArabic } = useEduLang();
  const [loading, setLoading] = useState(false);

  function go(
    page: "login" | "select-role" | "register-tutor" | "register-learner"
  ) {
    setLoading(true);

    setTimeout(() => {
      if (page === "login") {
        navigate({ to: "/login" });
      }

      if (page === "select-role") {
        navigate({ to: "/select-role" });
      }

      if (page === "register-tutor") {
        navigate({
          to: "/register",
          search: { role: "tutor" },
        });
      }

      if (page === "register-learner") {
        navigate({
          to: "/register",
          search: { role: "learner" },
        });
      }
    }, 650);
  }

  const text = {
    brand: "EduMind",
    login: isArabic ? "تسجيل الدخول" : "Login",
    getStarted: isArabic ? "ابدأ الآن" : "Get Started",

    eyebrow: isArabic
      ? "مدرّس ذكي • تعلّم بتوأم رقمي"
      : "AI Tutor • Digital Twin Learning",

    title1: isArabic ? "تعلّم من أسلوب" : "Learn from a tutor’s",
    title2: isArabic ? "مدرّسك الرقمي" : "Digital Twin",

    description: isArabic
      ? "تساعد EduMind المدرّسين على تحويل ملفاتهم وطريقة شرحهم إلى تجربة تعليمية ذكية. يستطيع المتعلم طرح الأسئلة، حل الاختبارات، ومعرفة المواضيع التي يحتاج إلى تحسينها."
      : "EduMind helps tutors turn their course resources and teaching style into an AI learning experience. Learners can ask questions, take quizzes, and discover the topics they need to improve.",

    tutorBtn: isArabic ? "انضم كمدرّس" : "Join as Tutor",
    learnerBtn: isArabic ? "انضم كمتعلم" : "Join as Learner",

    twinReady: isArabic ? "التوأم الرقمي جاهز" : "Digital Twin Ready",

    stepsTitle: isArabic ? "كيف تعمل المنصة؟" : "How it works",

    stepsSubtitle: isArabic
      ? "كورس واحد يتحول إلى مساحة تعليمية ذكية وشخصية"
      : "One course becomes a personalized AI learning space",

    roleTutor: isArabic ? "المدرّس" : "Tutor",
    roleTutorTitle: isArabic
      ? "أنشئ توأمك الرقمي"
      : "Build your Digital Twin",
    roleTutorDesc: isArabic
      ? "أنشئ الكورسات، ارفع الملفات، أضف تعليمات الشرح، وتابع نقاط ضعف المتعلمين."
      : "Create courses, upload PDFs, add teaching instructions, and track learner weaknesses.",

    roleLearner: isArabic ? "المتعلم" : "Learner",
    roleLearnerTitle: isArabic
      ? "تعلّم بدعم ذكي"
      : "Learn with AI support",
    roleLearnerDesc: isArabic
      ? "انضم للكورسات، اسأل المدرّس الذكي، حل الاختبارات، وراجع نقاط ضعفك."
      : "Join courses, ask the AI Tutor questions, take quizzes, and improve your weak topics.",
  };

  const steps = isArabic
    ? [
        {
          number: "01",
          title: "المدرّس ينشئ الكورس",
          desc: "يضيف اسم الكورس، المادة، المرحلة، الوصف، والأهداف التعليمية.",
        },
        {
          number: "02",
          title: "يرفع مصادر التعلم",
          desc: "ملفات PDF تتحول إلى قاعدة معرفة يعتمد عليها المدرّس الذكي.",
        },
        {
          number: "03",
          title: "التوأم الرقمي يشرح",
          desc: "الذكاء الاصطناعي يجيب اعتماداً على ملفات المدرّس وطريقة شرحه.",
        },
        {
          number: "04",
          title: "الاختبار يكشف الضعف",
          desc: "المتعلم يرى المواضيع الضعيفة ويطلب شرحاً إضافياً من الذكاء الاصطناعي.",
        },
      ]
    : [
        {
          number: "01",
          title: "Tutor creates a course",
          desc: "Course information, subject, grade, description, and goals.",
        },
        {
          number: "02",
          title: "Uploads resources",
          desc: "PDF files become the knowledge base for the AI Tutor.",
        },
        {
          number: "03",
          title: "Digital Twin teaches",
          desc: "The AI answers using the tutor’s materials and instructions.",
        },
        {
          number: "04",
          title: "Quiz finds weaknesses",
          desc: "Learners see their weak topics and can ask the AI for help.",
        },
      ];

  const flowItems = isArabic
    ? ["رفع PDF", "إضافة أسلوب الشرح", "المدرّس الذكي يشرح", "ظهور نقاط الضعف"]
    : ["Upload PDF", "Add teaching style", "AI Tutor teaches", "Weak topics appear"];

  return (
    <main className="em-landing" dir={dir}>
      {loading && <PageLoader />}

      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-shell">
        <nav className="em-nav">
          <h2>{text.brand}</h2>

          <div>
            <LanguageToggle lang={lang} setLang={setLang} />

            <button type="button" onClick={() => go("login")}>
              {text.login}
            </button>

            <button
              type="button"
              className="em-nav-cta"
              onClick={() => go("select-role")}
            >
              {text.getStarted}
            </button>
          </div>
        </nav>

        <section className="em-hero em-page-enter">
          <div className="em-hero-copy">
            <span className="em-eyebrow">{text.eyebrow}</span>

            <h1>
              {text.title1}
              <br />
              <span>{text.title2}</span>
            </h1>

            <p>{text.description}</p>

            <div className="em-hero-actions">
              <button
                type="button"
                className="em-btn em-btn-primary"
                onClick={() => go("register-tutor")}
              >
                {text.tutorBtn}
              </button>

              <button
                type="button"
                className="em-btn em-btn-soft"
                onClick={() => go("register-learner")}
              >
                {text.learnerBtn}
              </button>
            </div>
          </div>

          <div className="em-visual-card">
            <div className="em-card-header">
              <span />
              <span />
              <span />
            </div>

            <div className="em-twin-badge">{text.twinReady}</div>

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
            <span>{text.stepsTitle}</span>
            <h2>{text.stepsSubtitle}</h2>
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
              <span>{text.roleTutor}</span>
              <h3>{text.roleTutorTitle}</h3>
              <p>{text.roleTutorDesc}</p>
            </div>

            <button
              type="button"
              className="em-btn em-btn-light"
              onClick={() => go("register-tutor")}
            >
              {text.tutorBtn}
            </button>
          </div>

          <div className="em-role em-role-learner">
            <div>
              <span>{text.roleLearner}</span>
              <h3>{text.roleLearnerTitle}</h3>
              <p>{text.roleLearnerDesc}</p>
            </div>

            <button
              type="button"
              className="em-btn em-btn-soft"
              onClick={() => go("register-learner")}
            >
              {text.learnerBtn}
            </button>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}