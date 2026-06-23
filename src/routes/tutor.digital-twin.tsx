import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/tutor/digital-twin")({
  component: TutorDigitalTwinPage,
});

function TutorDigitalTwinPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const [fileStatus, setFileStatus] = useState("");
  const [form, setForm] = useState({
    courseName: "",
    subject: "",
    grade: "",
    description: "",
    instructions: "",
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function simulateUpload() {
    setFileStatus(isArabic ? "جاري رفع الملف..." : "Uploading file...");

    setTimeout(() => {
      setFileStatus(isArabic ? "جاري تحليل ملف PDF..." : "Analyzing PDF file...");
    }, 700);

    setTimeout(() => {
      setFileStatus(
        isArabic ? "الملف جاهز للتوأم الرقمي" : "File is ready for the Digital Twin"
      );
    }, 1500);
  }

  const t = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    createCourse: isArabic ? "إنشاء توأم رقمي" : "Create Digital Twin",
    results: isArabic ? "تحليل الضعف" : "Weakness Analysis",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "بناء التوأم الرقمي" : "Digital Twin Builder",
    title: isArabic
      ? "أنشئ كورساً يتعلم منه الذكاء الاصطناعي"
      : "Create a course your AI Tutor can learn from",
    desc: isArabic
      ? "أدخل معلومات الكورس، ارفع ملفات PDF، وأضف تعليمات طريقة الشرح ليصبح التوأم الرقمي قريباً من أسلوبك."
      : "Add course details, upload PDF resources, and write teaching instructions so the Digital Twin follows your style.",

    courseInfo: isArabic ? "معلومات الكورس" : "Course Information",
    courseName: isArabic ? "اسم الكورس" : "Course Name",
    subject: isArabic ? "المادة" : "Subject",
    grade: isArabic ? "المرحلة / المستوى" : "Grade / Level",
    description: isArabic ? "وصف الكورس" : "Course Description",
    instructions: isArabic ? "تعليمات طريقة الشرح" : "Teaching Instructions",

    uploadTitle: isArabic ? "رفع مصادر PDF" : "Upload PDF Resources",
    uploadDesc: isArabic
      ? "ارفع ملفاً تعليمياً ليستخدمه التوأم الرقمي في الإجابات والشرح."
      : "Upload learning material so the Digital Twin can use it in answers and explanations.",
    uploadButton: isArabic ? "اختيار ملف PDF" : "Choose PDF File",

    previewTitle: isArabic ? "ملخص التوأم الرقمي" : "Digital Twin Summary",
    ready: isArabic ? "جاهز مبدئياً" : "Initial setup ready",
    create: isArabic ? "إنشاء التوأم الرقمي" : "Create Digital Twin",

    step1: isArabic ? "معلومات الكورس" : "Course details",
    step2: isArabic ? "ملفات PDF" : "PDF resources",
    step3: isArabic ? "تعليمات الشرح" : "Teaching style",
    step4: isArabic ? "جاهز للمتعلمين" : "Ready for learners",
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
        </header>

        <section className="em-builder-steps">
          {[t.step1, t.step2, t.step3, t.step4].map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </article>
          ))}
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.courseInfo}</span>
                <h2>{t.courseName}</h2>
              </div>
            </div>

            <form className="em-builder-form">
              <label>
                {t.courseName}
                <input
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder={isArabic ? "مثال: أساسيات الرياضيات" : "Example: Math Basics"}
                />
              </label>

              <label>
                {t.subject}
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder={isArabic ? "مثال: رياضيات" : "Example: Mathematics"}
                />
              </label>

              <label>
                {t.grade}
                <input
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  placeholder={isArabic ? "مثال: سنة أولى" : "Example: First Year"}
                />
              </label>

              <label>
                {t.description}
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder={
                    isArabic
                      ? "اكتب وصفاً قصيراً للكورس..."
                      : "Write a short course description..."
                  }
                />
              </label>

              <label>
                {t.instructions}
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder={
                    isArabic
                      ? "مثال: اشرح بطريقة بسيطة مع أمثلة خطوة بخطوة..."
                      : "Example: Explain simply with step-by-step examples..."
                  }
                />
              </label>
            </form>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.uploadTitle}</span>
                <h2>{t.uploadButton}</h2>
              </div>
            </div>

            <button
              type="button"
              className="em-upload-action"
              onClick={simulateUpload}
            >
              <strong>PDF</strong>
              <span>{t.uploadDesc}</span>
            </button>

            {fileStatus && (
              <div className="em-file-preview">
                <div>
                  <strong>course-material.pdf</strong>
                  <p>{fileStatus}</p>
                </div>

                <span>{fileStatus}</span>
              </div>
            )}

            <div className="em-panel-head em-preview-head">
              <div>
                <span>{t.previewTitle}</span>
                <h2>{t.ready}</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              <span>{form.courseName || t.courseName}</span>
              <span>{form.subject || t.subject}</span>
              <span>{fileStatus || t.uploadTitle}</span>
            </div>

            <button type="button" className="em-btn em-btn-primary em-full-btn">
              {t.create}
            </button>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}