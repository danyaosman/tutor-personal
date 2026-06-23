import { useEffect, useState } from "react";

export type EduLang = "ar" | "en";
export type EduRole = "tutor" | "learner";

type LanguageToggleProps = {
  lang: EduLang;
  setLang: (lang: EduLang) => void;
};

type RoleSwitchProps = {
  role: EduRole;
  setRole: (role: EduRole) => void;
  tutorLabel: string;
  learnerLabel: string;
};

type EduFooterProps = {
  lang: EduLang;
};

export function useEduLang() {
  const [lang, setLangState] = useState<EduLang>(() => {
    if (typeof window === "undefined") {
      return "ar";
    }

    const savedLang = localStorage.getItem("edumind_lang");
    return savedLang === "en" ? "en" : "ar";
  });

  function setLang(nextLang: EduLang) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edumind_lang", nextLang);
    }

    setLangState(nextLang);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return {
    lang,
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
    isArabic: lang === "ar",
  };
}

export function PageLoader() {
  return (
    <div className="edu-page-loader">
      <div className="edu-loader-card">
        <div className="edu-loader-mark">EduMind</div>
        <div className="edu-loader-line" />
      </div>
    </div>
  );
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="edu-lang-switch" aria-label="Language switcher">
      <button
        type="button"
        className={lang === "ar" ? "is-active" : ""}
        onClick={() => setLang("ar")}
      >
        عربي
      </button>

      <button
        type="button"
        className={lang === "en" ? "is-active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}

export function RoleSwitch({
  role,
  setRole,
  tutorLabel,
  learnerLabel,
}: RoleSwitchProps) {
  return (
    <div className="edu-simple-role-switch" data-role={role}>
      <button
        type="button"
        className={role === "tutor" ? "active" : ""}
        onClick={() => setRole("tutor")}
      >
        {tutorLabel}
      </button>

      <button
        type="button"
        className={role === "learner" ? "active" : ""}
        onClick={() => setRole("learner")}
      >
        {learnerLabel}
      </button>
    </div>
  );
}

export function EduFooter({ lang }: EduFooterProps) {
  const isArabic = lang === "ar";

  return (
    <footer className="edu-site-footer" dir={isArabic ? "rtl" : "ltr"}>
      <div className="edu-footer-inner">
        <div className="edu-footer-brand">
          <h2>EduMind</h2>

          <p>
            {isArabic
              ? "منصة تعليمية ذكية تساعد المدرّس على بناء توأم رقمي، وتساعد المتعلم على الدراسة بطريقة شخصية وواضحة."
              : "An intelligent learning platform that helps tutors build a Digital Twin and helps learners study in a personalized way."}
          </p>
        </div>

        <div className="edu-footer-col">
          <h3>{isArabic ? "المنصة" : "Platform"}</h3>
          <a href="/">{isArabic ? "الرئيسية" : "Home"}</a>
          <a href="/select-role">{isArabic ? "إنشاء حساب" : "Create account"}</a>
          <a href="/login">{isArabic ? "تسجيل الدخول" : "Login"}</a>
        </div>

        <div className="edu-footer-col">
          <h3>{isArabic ? "المسارات" : "Roles"}</h3>
          <a href="/tutor/overview">{isArabic ? "مساحة المدرّس" : "Tutor space"}</a>
          <a href="/learner">{isArabic ? "مساحة المتعلم" : "Learner space"}</a>
          <a href="/tutor/digital-twin">
            {isArabic ? "التوأم الرقمي" : "Digital Twin"}
          </a>
        </div>

        <div className="edu-footer-col">
          <h3>{isArabic ? "النظام" : "System"}</h3>
          <span>{isArabic ? "AI Tutor" : "AI Tutor"}</span>
          <span>{isArabic ? "PDF Resources" : "PDF Resources"}</span>
          <span>{isArabic ? "Weakness Analysis" : "Weakness Analysis"}</span>
        </div>
      </div>

      <div className="edu-footer-bottom">
        <span>© 2026 EduMind</span>
        <span>{isArabic ? "مشروع واجهة تعليمية ذكية" : "Smart learning interface project"}</span>
      </div>
    </footer>
  );
}