import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/tutor/digital-twin")({
  component: TutorDigitalTwinPage,
});

function TutorDigitalTwinPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  const [form, setForm] = useState({
    courseName: "",
    subject: "",
    grade: "",
    description: "",
    instructions: "",
  });

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
      ? "أدخل معلومات الكورس، ارفع ملف PDF، وأضف تعليمات طريقة الشرح ليصبح التوأم الرقمي قريباً من أسلوبك."
      : "Add course details, upload a PDF resource, and write teaching instructions so the Digital Twin follows your style.",

    courseInfo: isArabic ? "معلومات الكورس" : "Course Information",
    courseName: isArabic ? "اسم الكورس" : "Course Name",
    subject: isArabic ? "المادة" : "Subject",
    grade: isArabic ? "المرحلة / المستوى" : "Grade / Level",
    description: isArabic ? "وصف الكورس" : "Course Description",
    instructions: isArabic ? "تعليمات طريقة الشرح" : "Teaching Instructions",

    uploadTitle: isArabic ? "رفع مصادر PDF" : "Upload PDF Resources",
    uploadDesc: isArabic
      ? "اضغطي هنا لاختيار ملف PDF من جهازك."
      : "Click here to choose a PDF file from your device.",
    fileUploading: isArabic ? "جاري رفع الملف..." : "Uploading file...",
    fileProcessing: isArabic ? "جاري تحليل ملف PDF..." : "Analyzing PDF file...",
    fileReady: isArabic
      ? "الملف جاهز للتوأم الرقمي"
      : "File is ready for the Digital Twin",

    previewTitle: isArabic ? "ملخص التوأم الرقمي" : "Digital Twin Summary",
    ready: isArabic ? "جاهز مبدئياً" : "Initial setup ready",
    create: isArabic ? "إنشاء التوأم الرقمي" : "Create Digital Twin",

    missing: isArabic
      ? "رجاءً املئي اسم الكورس، المادة، المرحلة، واختاري ملف PDF أولاً."
      : "Please fill course name, subject, grade, and choose a PDF file first.",
    success: isArabic
      ? "تم إنشاء التوأم الرقمي وحفظه مؤقتاً بنجاح."
      : "Digital Twin has been created and saved temporarily.",

    step1: isArabic ? "معلومات الكورس" : "Course details",
    step2: isArabic ? "ملف PDF" : "PDF file",
    step3: isArabic ? "تعليمات الشرح" : "Teaching style",
    step4: isArabic ? "جاهز للمتعلمين" : "Ready for learners",

    fileName: isArabic ? "اسم الملف" : "File name",
    fileSize: isArabic ? "حجم الملف" : "File size",
    temporaryNote: isArabic
      ? "ملاحظة: حالياً يتم حفظ البيانات مؤقتاً داخل المتصفح لأن الربط مع الـ backend لم يتم بعد."
      : "Note: For now, data is saved temporarily in the browser because backend integration is not connected yet.",
  };

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setCreateMessage("");
    setFileStatus(t.fileUploading);

    setTimeout(() => {
      setFileStatus(t.fileProcessing);
    }, 700);

    setTimeout(() => {
      setFileStatus(t.fileReady);
    }, 1500);
  }

  function formatFileSize(size: number) {
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function handleCreateDigitalTwin() {
    const isMissingRequiredData =
      !form.courseName.trim() ||
      !form.subject.trim() ||
      !form.grade.trim() ||
      !selectedFile;

    if (isMissingRequiredData) {
      setCreateMessage(t.missing);
      return;
    }

    const newDigitalTwin = {
      id: Date.now(),
      courseName: form.courseName,
      subject: form.subject,
      grade: form.grade,
      description: form.description,
      instructions: form.instructions,
      file: {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      },
      createdAt: new Date().toISOString(),
    };

    const savedTwins = JSON.parse(
      localStorage.getItem("edumind_digital_twins") || "[]"
    );

    localStorage.setItem(
      "edumind_digital_twins",
      JSON.stringify([...savedTwins, newDigitalTwin])
    );

    setCreateMessage(t.success);
  }

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
                  placeholder={
                    isArabic ? "مثال: أساسيات الرياضيات" : "Example: Math Basics"
                  }
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
                <h2>PDF</h2>
              </div>
            </div>

            <label className="em-upload-action">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <strong>PDF</strong>

              <span>{selectedFile ? selectedFile.name : t.uploadDesc}</span>
            </label>

            {selectedFile && (
              <div className="em-file-preview">
                <div>
                  <strong>{selectedFile.name}</strong>
                  <p>
                    {t.fileSize}: {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <span>{fileStatus}</span>
              </div>
            )}

            <div className="em-panel-head em-preview-head">
              <div>
                <span>{t.previewTitle}</span>
                <h2>{selectedFile ? t.ready : t.uploadTitle}</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              <span>{form.courseName || t.courseName}</span>
              <span>{form.subject || t.subject}</span>
              <span>{selectedFile ? selectedFile.name : t.uploadTitle}</span>
            </div>

            <p className="em-builder-copy">{t.temporaryNote}</p>

            {createMessage && (
              <div className="em-file-preview">
                <div>
                  <strong>{createMessage}</strong>
                </div>
              </div>
            )}

            <button
              type="button"
              className="em-btn em-btn-primary em-full-btn"
              onClick={handleCreateDigitalTwin}
            >
              {t.create}
            </button>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}