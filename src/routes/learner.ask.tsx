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
        ? `سؤالك ممتاز. بناءً على كورس "${selectedCourse}"، خلينا نبسط الفكرة خطوة بخطوة ونربطها بمثال واضح. بعدين فيك تحل اختبار قصير لتتأكد من فهمك.`
        : `Great question. Based on "${selectedCourse}", let's simplify the idea step by step and connect it to a clear example. Then you can take a short quiz to check your understanding.`,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      learnerMessage,
      aiMessage,
    ]);
    setQuestion("");
  }

  function handleQuestionChange(event: ChangeEvent<HTMLInputElement>) {
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
    placeholder: isArabic ? "اكتب سؤالك هنا..." : "Write your question here...",
    send: isArabic ? "إرسال السؤال" : "Send Question",
    quickHelp: isArabic ? "اقتراحات سريعة" : "Quick Suggestions",
    suggestion1: isArabic ? "اشرح لي هذا الدرس ببساطة" : "Explain this lesson simply",
    suggestion2: isArabic ? "أعطني مثالاً خطوة بخطوة" : "Give me a step-by-step example",
    suggestion3: isArabic ? "ما أهم نقطة لازم أراجعها؟" : "What should I review first?",
    startQuiz: isArabic ? "ابدأ اختباراً" : "Start a Quiz",
    sideTitle: isArabic ? "ابدأ من هنا" : "Start from here",
    sideNote: isArabic
      ? "اختَر اقتراحاً سريعاً أو اكتب سؤالك بنفسك، وبعد المحادثة يمكنك الانتقال للاختبار لتتأكد من فهمك."
      : "Pick a quick suggestion or write your own question, then move to the quiz to check your understanding.",
    you: isArabic ? "أنت" : "You",
  };

  const suggestions = [t.suggestion1, t.suggestion2, t.suggestion3];

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

        <section className="em-chat-layout">
          <div className="em-chat-panel">
            <div className="em-chat-top">
              <div>
                <span>{t.chatTitle}</span>
                <h2>{t.chatDesc}</h2>
                <p>{isArabic ? "اختر الكورس ثم اكتب سؤالك بوضوح." : "Choose a course, then write your question clearly."}</p>
              </div>

              <small>{selectedCourse}</small>
            </div>

            <label
              className="em-wide-field"
              style={{ marginTop: 0, marginBottom: 18 }}
            >
              {t.selectCourse}
              <select
                className="em-search-input"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                style={{ width: "100%" }}
              >
                {edCourses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="em-chat-box-premium">
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "ai"
                      ? "em-chat-bubble em-ai-bubble"
                      : "em-chat-bubble em-user-bubble"
                  }
                >
                  <p>{message.text}</p>
                  <span>{message.role === "ai" ? "EduMind AI" : t.you}</span>
                </article>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="em-chat-input-premium">
              <input
                value={question}
                onChange={handleQuestionChange}
                placeholder={t.placeholder}
              />

              <button type="submit" className="em-btn em-btn-primary">
                {t.send}
              </button>
            </form>
          </div>

          <aside className="em-chat-side">
            <div className="em-chat-top" style={{ display: "block" }}>
              <span>{t.quickHelp}</span>
              <h2>{t.sideTitle}</h2>
              <p>{t.sideNote}</p>
            </div>

            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuestion(suggestion)}
                style={{ textAlign: isArabic ? "right" : "left" }}
              >
                {suggestion}
              </button>
            ))}

            <Link to="/learner/quizzes" className="em-btn em-btn-primary">
              {t.startQuiz}
            </Link>
          </aside>
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
