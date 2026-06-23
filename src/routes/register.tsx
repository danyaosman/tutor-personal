import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  EduFooter,
  LanguageToggle,
  PageLoader,
  RoleSwitch,
  useEduLang,
} from "../lib/edumindUi";

type RegisterSearch = {
  role?: "tutor" | "learner";
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      role:
        search.role === "tutor" || search.role === "learner"
          ? search.role
          : "tutor",
    };
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { role: initialRole = "tutor" } = Route.useSearch();
  const { lang, setLang, dir, isArabic } = useEduLang();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"tutor" | "learner">(initialRole);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    localStorage.setItem(
      "edumind_user",
      JSON.stringify({
        ...form,
        role,
      })
    );

    setTimeout(() => {
      if (role === "tutor") {
        navigate({ to: "/tutor/overview" });
      } else {
        navigate({ to: "/learner" });
      }
    }, 700);
  }

  const text = {
    login: isArabic ? "تسجيل الدخول" : "Login",
    tutorAccount: isArabic ? "حساب المدرّس" : "Tutor account",
    learnerAccount: isArabic ? "حساب المتعلم" : "Learner account",
    tutorTitle: isArabic ? "ابنِ توأمك التعليمي." : "Build your teaching twin.",
    learnerTitle: isArabic ? "ابدأ تعلماً أذكى." : "Start learning smarter.",
    tutorDesc: isArabic
      ? "أنشئ كورسات، ارفع ملفات PDF، أضف تعليمات الشرح، وتابع تقدم المتعلمين من لوحة واحدة."
      : "Create courses, upload PDFs, add your teaching instructions, and follow learner progress from one clean dashboard.",
    learnerDesc: isArabic
      ? "انضم للكورسات، تحدث مع التوأم الرقمي للمدرّس، حل الاختبارات، وافهم نقاط ضعفك بسرعة."
      : "Join courses, chat with your tutor’s Digital Twin, take quizzes, and understand your weak topics faster.",
    register: isArabic ? "إنشاء حساب" : "Register",
    iAmTutor: isArabic ? "أنا مدرّس" : "I am a Tutor",
    iAmLearner: isArabic ? "أنا متعلم" : "I am a Learner",
    tutor: isArabic ? "مدرّس" : "Tutor",
    learner: isArabic ? "متعلم" : "Learner",
    name: isArabic ? "الاسم" : "Name",
    username: isArabic ? "اسم المستخدم" : "Username",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    password: isArabic ? "كلمة المرور" : "Password",
    create: isArabic ? "إنشاء الحساب" : "Create Account",
    already: isArabic ? "لديك حساب بالفعل؟" : "Already have an account?",
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

        <div className="em-form-layout">
          <div className="em-form-intro em-role-copy" key={role}>
            <span>
              {role === "tutor" ? text.tutorAccount : text.learnerAccount}
            </span>

            <h1>{role === "tutor" ? text.tutorTitle : text.learnerTitle}</h1>

            <p>{role === "tutor" ? text.tutorDesc : text.learnerDesc}</p>

            <RoleSwitch
              role={role}
              setRole={setRole}
              tutorLabel={text.tutor}
              learnerLabel={text.learner}
            />
          </div>

          <form onSubmit={handleSubmit} className="em-form-card">
            <div className="em-form-header em-role-copy" key={`${role}-header`}>
              <span>{text.register}</span>
              <h2>{role === "tutor" ? text.iAmTutor : text.iAmLearner}</h2>
            </div>

            <div className="em-input-grid">
              <label>
                {text.name}
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                {text.username}
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                {text.email}
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                {text.password}
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button type="submit" className="em-btn em-btn-primary em-full-btn">
              {text.create}
            </button>

            <p className="em-form-note">
              {text.already} <Link to="/login">{text.login}</Link>
            </p>
          </form>
        </div>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}