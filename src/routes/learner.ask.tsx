import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { edCourses } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/ask")({
  component: LearnerAskPage,
});

type ChatMessage = {
  role: "learner" | "ai";
  text: string;
};

function LearnerAskPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const [question, setQuestion] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(edCourses[0]?.name || "");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: isArabic
        ? "مرحباً، أنا المدرّس الذكي. اختر كورساً واسألني عن أي نقطة غير واضحة."
        : "Hi, I am your AI Tutor. Choose a course and ask me about anything unclear.",
    },
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    const learnerMessage: ChatMessage = {
      role: "learner",
      text: question,
    };

    const aiMessage: ChatMessage = {
      role: "ai",
      text: isArabic
        ? `سؤالك ممتاز. بناءً على كورس "${selectedCourse}"، أنصحك أن تراجع الفكرة خطوة بخطوة وتربطها بمثال بسيط. يمكنك أيضاً حل اختبار قصير لمعرفة نقطة الضعف بدقة.`
        : `Great question. Based on "${selectedCourse}", I recommend reviewing the idea step by step and connecting it to a simple example. You can also take a short quiz to detect the weak point clearly.`,
    };

    setMessages((currentMessages) => [...currentMessages, learnerMessage, aiMessage]);
    setQuestion("");
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(event.target.value);
  }

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "محادثة تعليمية" : "Learning Chat",
    title: isArabic ? "اسأل التوأم الرقمي للمدرّس" : "Ask the tutor’s Digital Twin",
    desc: isArabic
      ? "اكتب سؤالك وسيحاول المدرّس الذكي الإجابة اعتماداً على مصادر الكورس وطريقة شرح المدرّس."
      : "Write your question and the AI Tutor will answer based on the course resources and teaching style.",

    selectCourse: isArabic ? "اختر الكورس" : "Select course",
    chatTitle: isArabic ? "المحادثة" : "Conversation",
    chatDesc: isArabic
      ? "اسأل عن المفاهيم، الأمثلة، أو نقاط الضعف."
      : "Ask about concepts, examples, or weak points.",
    placeholder: isArabic
      ? "اكتب سؤالك هنا..."
      : "Write your question here...",
    send: isArabic ? "إرسال السؤال" : "Send Question",
    quickHelp: isArabic ? "اقتراحات سريعة" : "Quick Suggestions",
    suggestion1: isArabic ? "اشرح لي هذا الدرس ببساطة" : "Explain this lesson simply",
    suggestion2: isArabic ? "أعطني مثالاً خطوة بخطوة" : "Give me a step-by-step example",
    suggestion3: isArabic ? "ما أهم نقطة لازم أراجعها؟" : "What should I review first?",
    startQuiz: isArabic ? "ابدأ اختباراً" : "Start a Quiz",
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

          <Link to="/learner/quizzes" className="em-btn em-btn-primary">
            {t.startQuiz}
          </Link>
        </header>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.chatTitle}</span>
                <h2>{t.chatDesc}</h2>
              </div>
            </div>

            <label className="em-builder-copy">
              {t.selectCourse}
              <select
                className="em-search-input"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                {edCourses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="em-result-list">
              {messages.map((message, index) => (
                <article
                  key={index}
                  className={
                    message.role === "ai"
                      ? "em-result-card"
                      : "em-result-card em-stat-orange"
                  }
                >
                  <div>
                    <h3>{message.role === "ai" ? "EduMind AI" : isArabic ? "أنت" : "You"}</h3>
                    <p>{message.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="em-builder-form">
              <label>
                {t.ask}
                <textarea
                  value={question}
                  onChange={handleChange}
                  placeholder={t.placeholder}
                />
              </label>

              <button type="submit" className="em-btn em-btn-primary em-full-btn">
                {t.send}
              </button>
            </form>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>{t.quickHelp}</span>
                <h2>{isArabic ? "ابدأ من هنا" : "Start from here"}</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              {[t.suggestion1, t.suggestion2, t.suggestion3].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <p className="em-builder-copy">
              {isArabic
                ? "بعد المحادثة، يمكنك حل اختبار قصير حتى تعرف إذا فهمت الفكرة أو ما زلت تحتاج مراجعة."
                : "After chatting, you can take a short quiz to check whether you understood the idea or still need review."}
            </p>

            <Link to="/learner/quizzes" className="em-btn em-btn-primary">
              {t.startQuiz}
            </Link>
          </div>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}