import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  EduFooter,
  LanguageToggle,
  PageLoader,
  RoleSwitch,
  useEduLang,
} from "../lib/edumindUi";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { lang, setLang, dir, isArabic } = useEduLang();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"tutor" | "learner">("learner");

  const [form, setForm] = useState({
    username: "",
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
        username: form.username,
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
    createAccount: isArabic ? "إنشاء حساب" : "Create account",
    welcome: isArabic ? "مرحباً بعودتك" : "Welcome back",
    title: isArabic ? "تابع رحلتك في EduMind" : "Continue your EduMind journey",
    desc: isArabic
      ? "سجّل الدخول كمدرّس لإدارة الكورسات، أو كمتعلم لمتابعة الدراسة مع المدرّس الذكي."
      : "Login as a tutor to manage courses, or as a learner to continue studying with your AI Tutor.",
    username: isArabic ? "اسم المستخدم" : "Username",
    password: isArabic ? "كلمة المرور" : "Password",
    tutor: isArabic ? "مدرّس" : "Tutor",
    learner: isArabic ? "متعلم" : "Learner",
    login: isArabic ? "تسجيل الدخول" : "Login",
    newHere: isArabic ? "جديد هنا؟" : "New here?",
  };

  return (
    <main className="em-auth-page" dir={dir}>
      {loading && <PageLoader />}

      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-auth-shell em-login-shell">
        <nav className="em-auth-nav">
          <Link to="/" className="em-auth-logo">
            EduMind
          </Link>

          <div className="em-auth-nav-actions">
            <LanguageToggle lang={lang} setLang={setLang} />

            <Link to="/select-role" className="em-auth-nav-link">
              {text.createAccount}
            </Link>
          </div>
        </nav>

        <div className="em-login-card em-page-enter">
          <div className="em-form-header em-role-copy" key={role}>
            <span>{text.welcome}</span>

            <h1>{text.title}</h1>

            <p>{text.desc}</p>
          </div>

          <RoleSwitch
            role={role}
            setRole={setRole}
            tutorLabel={text.tutor}
            learnerLabel={text.learner}
          />

          <form onSubmit={handleSubmit} className="em-login-form">
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
              {text.password}
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit" className="em-btn em-btn-primary em-full-btn">
              {text.login}
            </button>
          </form>

          <p className="em-form-note">
            {text.newHere} <Link to="/select-role">{text.createAccount}</Link>
          </p>
        </div>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}