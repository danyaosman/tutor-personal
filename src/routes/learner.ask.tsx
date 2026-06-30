import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties, type ChangeEvent, type FormEvent } from "react";
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
  const [errorMessage, setErrorMessage] = useState("");

  const text = {
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
    conversation: isArabic ? "المحادثة" : "Conversation",
    conversationTitle: isArabic
      ? "اسأل عن المفاهيم، الأمثلة، أو نقاط الضعف."
      : "Ask about concepts, examples, or weak points.",
    placeholder: isArabic ? "اكتب سؤالك هنا..." : "Write your question here...",
    send: isArabic ? "إرسال السؤال" : "Send Question",
    quickHelp: isArabic ? "اقتراحات سريعة" : "Quick Suggestions",
    quickTitle: isArabic ? "ابدأ من هنا" : "Start from here",
    quickDesc: isArabic
      ? "اختاري اقتراحاً سريعاً أو اكتبي سؤالك بنفسك، وبعد المحادثة يمكنك الانتقال للاختبار لتتأكدي من فهمك."
      : "Choose a quick prompt or write your own question, then move to the quiz to check your understanding.",
    suggestion1: isArabic ? "اشرح لي هذا الدرس ببساطة" : "Explain this lesson simply",
    suggestion2: isArabic ? "أعطني مثالاً خطوة بخطوة" : "Give me a step-by-step example",
    suggestion3: isArabic ? "ما أهم نقطة لازم أراجعها؟" : "What should I review first?",
    startQuiz: isArabic ? "ابدأ اختباراً" : "Start a Quiz",
    you: isArabic ? "أنت" : "You",
    aiName: "EduMind AI",
    emptyError: isArabic ? "اكتبي سؤالك أولاً." : "Write your question first.",
  };

  const styles = useMemo(() => createStyles(isArabic), [isArabic]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(event.target.value);
    setErrorMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setErrorMessage(text.emptyError);
      return;
    }

    const learnerMessage: ChatMessage = {
      role: "learner",
      text: trimmedQuestion,
    };

    const aiMessage: ChatMessage = {
      role: "ai",
      text: isArabic
        ? `سؤالك ممتاز. بناءً على كورس "${selectedCourse}"، راجعي الفكرة خطوة بخطوة واربطيها بمثال بسيط، ثم جرّبي سؤالاً قصيراً لتتأكدي من فهمك.`
        : `Great question. Based on "${selectedCourse}", review the idea step by step, connect it to a simple example, then try a short question to check your understanding.`,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      learnerMessage,
      aiMessage,
    ]);
    setQuestion("");
    setErrorMessage("");
  }

  function useSuggestion(suggestion: string) {
    setQuestion(suggestion);
    setErrorMessage("");
  }

  const chatCard = (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.badge}>{text.conversation}</span>
        <h2 style={styles.cardTitle}>{text.conversationTitle}</h2>
      </div>

      <label style={styles.coursePicker}>
        <span style={styles.fieldLabel}>{text.selectCourse}</span>
        <select
          style={styles.select}
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

      <div style={styles.messagesBox} aria-live="polite">
        {messages.map((message, index) => {
          const isAi = message.role === "ai";

          return (
            <article
              key={`${message.role}-${index}`}
              style={{
                ...styles.message,
                ...(isAi ? styles.aiMessage : styles.userMessage),
              }}
            >
              <strong style={styles.messageName}>
                {isAi ? text.aiName : text.you}
              </strong>
              <p style={styles.messageText}>{message.text}</p>
            </article>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} style={styles.askForm}>
        <textarea
          style={styles.textarea}
          value={question}
          onChange={handleChange}
          placeholder={text.placeholder}
          aria-label={text.ask}
        />

        <button type="submit" style={styles.primaryButton}>
          {text.send}
        </button>
      </form>

      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
    </section>
  );

  const quickCard = (
    <aside style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.badge}>{text.quickHelp}</span>
        <h2 style={styles.cardTitle}>{text.quickTitle}</h2>
      </div>

      <p style={styles.quickDesc}>{text.quickDesc}</p>

      <div style={styles.suggestions}>
        {[text.suggestion1, text.suggestion2, text.suggestion3].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            style={styles.suggestionButton}
            onClick={() => useSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <Link to="/learner/quizzes" style={styles.primaryLinkButton}>
        {text.startQuiz}
      </Link>
    </aside>
  );

  return (
    <main style={styles.page} dir={dir}>
      <div style={styles.orbOne} />
      <div style={styles.orbTwo} />

      <section style={styles.shell}>
        <nav style={styles.nav}>
          <Link to="/" style={styles.logo}>
            EduMind
          </Link>

          <div style={styles.navLinks}>
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link to="/learner" style={styles.navLink}>{text.dashboard}</Link>
            <Link to="/learner/courses" style={styles.navLink}>{text.courses}</Link>
            <Link to="/learner/ask" style={styles.navLinkActive}>{text.ask}</Link>
            <Link to="/learner/quizzes" style={styles.navLink}>{text.quizzes}</Link>
            <Link to="/learner/weaknesses" style={styles.navLink}>{text.weaknesses}</Link>
            <Link to="/" style={styles.navLink}>{text.logout}</Link>
          </div>
        </nav>

        <header style={styles.hero}>
          <div>
            <span style={styles.badge}>{text.badge}</span>
            <h1 style={styles.title}>{text.title}</h1>
            <p style={styles.desc}>{text.desc}</p>
          </div>

          <Link to="/learner/quizzes" style={styles.heroButton}>
            {text.startQuiz}
          </Link>
        </header>

        <section style={styles.contentGrid}>
          {isArabic ? (
            <>
              {quickCard}
              {chatCard}
            </>
          ) : (
            <>
              {chatCard}
              {quickCard}
            </>
          )}
        </section>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}

function createStyles(isArabic: boolean): Record<string, CSSProperties> {
  const navPill: CSSProperties = {
    color: "#27187e",
    background: "rgba(174, 184, 254, 0.56)",
    padding: "9px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 8px 18px rgba(39, 24, 126, 0.08)",
    whiteSpace: "nowrap",
  };

  const buttonBase: CSSProperties = {
    border: "none",
    cursor: "pointer",
    minHeight: "48px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    padding: "0 22px",
    color: "#ffffff",
    background: "#758bfd",
    boxShadow: "0 14px 28px rgba(117, 139, 253, 0.35)",
    fontSize: "13px",
    fontWeight: 800,
    textDecoration: "none",
    fontFamily: "inherit",
  };

  return {
    page: {
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
      background:
        "radial-gradient(circle at 12% 12%, rgba(255,255,255,.95), transparent 28%), radial-gradient(circle at 82% 18%, rgba(174,184,254,.42), transparent 30%), linear-gradient(135deg, #f1f2f6 0%, #d7d8f1 38%, #928cc5 70%, #4b3f91 100%)",
      color: "#27187e",
      padding: "34px",
      fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif",
    },
    orbOne: {
      position: "absolute",
      width: "260px",
      height: "260px",
      borderRadius: "999px",
      background: "rgba(117, 139, 253, 0.18)",
      top: "70px",
      right: "120px",
      pointerEvents: "none",
    },
    orbTwo: {
      position: "absolute",
      width: "180px",
      height: "180px",
      borderRadius: "999px",
      background: "rgba(255, 134, 0, 0.14)",
      bottom: "80px",
      left: "120px",
      pointerEvents: "none",
    },
    shell: {
      position: "relative",
      zIndex: 1,
      width: "min(1180px, 100%)",
      margin: "0 auto",
    },
    nav: {
      minHeight: "58px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "20px",
      marginBottom: "44px",
      flexWrap: "wrap",
    },
    logo: {
      color: "#27187e",
      fontSize: "25px",
      fontWeight: 800,
      letterSpacing: "-0.5px",
      textDecoration: "none",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      justifyContent: isArabic ? "flex-start" : "flex-end",
      flexWrap: "wrap",
      gap: "10px",
    },
    navLink: navPill,
    navLinkActive: {
      ...navPill,
      color: "#ffffff",
      background: "#758bfd",
    },
    hero: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "24px",
      marginBottom: "30px",
      flexWrap: "wrap",
    },
    badge: {
      display: "inline-flex",
      width: "fit-content",
      color: "#27187e",
      background: "rgba(174, 184, 254, 0.58)",
      border: "1px solid rgba(174, 184, 254, 0.95)",
      padding: "8px 14px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 800,
      marginBottom: "14px",
    },
    title: {
      maxWidth: "820px",
      margin: 0,
      color: "#27187e",
      fontSize: "clamp(42px, 5vw, 72px)",
      lineHeight: 0.96,
      fontWeight: 800,
      letterSpacing: "-2.4px",
    },
    desc: {
      maxWidth: "760px",
      margin: "20px 0 0",
      color: "#05014d",
      fontSize: "15px",
      lineHeight: 1.8,
      fontWeight: 650,
    },
    heroButton: buttonBase,
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(310px, .72fr) minmax(0, 1.18fr)",
      gap: "24px",
      alignItems: "stretch",
      marginBottom: "46px",
    },
    card: {
      borderRadius: "28px",
      padding: "28px",
      background:
        "linear-gradient(145deg, rgba(255,255,255,.42), rgba(174,184,254,.18)), rgba(255,255,255,.2)",
      border: "1.5px solid rgba(174, 184, 254, 0.78)",
      boxShadow:
        "0 24px 60px rgba(39,24,126,.14), inset 0 1px 0 rgba(255,255,255,.32)",
      minWidth: 0,
    },
    cardHeader: {
      marginBottom: "20px",
    },
    cardTitle: {
      color: "#27187e",
      fontSize: "clamp(22px, 3vw, 31px)",
      lineHeight: 1.15,
      margin: 0,
      fontWeight: 800,
      letterSpacing: "-0.8px",
    },
    coursePicker: {
      display: "grid",
      gridTemplateColumns: "auto minmax(210px, 360px)",
      gap: "14px",
      alignItems: "center",
      width: "fit-content",
      maxWidth: "100%",
      marginBottom: "18px",
      marginInlineStart: isArabic ? "auto" : 0,
    },
    fieldLabel: {
      color: "#27187e",
      fontSize: "13px",
      fontWeight: 800,
      whiteSpace: "nowrap",
    },
    select: {
      width: "min(360px, 100%)",
      height: "50px",
      border: "none",
      outline: "none",
      borderRadius: "999px",
      padding: "0 18px",
      color: "#27187e",
      background: "rgba(241, 242, 246, 0.92)",
      fontSize: "13px",
      fontWeight: 800,
      boxShadow: "inset 0 0 0 1px rgba(174,184,254,.4)",
      fontFamily: "inherit",
    },
    messagesBox: {
      minHeight: "220px",
      maxHeight: "340px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "18px",
      borderRadius: "24px",
      background: "rgba(241,242,246,.42)",
      border: "1px solid rgba(174,184,254,.48)",
    },
    message: {
      width: "fit-content",
      maxWidth: "min(82%, 620px)",
      padding: "13px 16px",
      borderRadius: "18px",
      lineHeight: 1.65,
      boxShadow: "0 10px 22px rgba(39,24,126,.08)",
    },
    aiMessage: {
      alignSelf: "flex-start",
      background: "rgba(255,255,255,.86)",
      color: "#05014d",
    },
    userMessage: {
      alignSelf: "flex-end",
      color: "#ffffff",
      background: "#758bfd",
    },
    messageName: {
      display: "block",
      marginBottom: "5px",
      color: "inherit",
      fontSize: "13px",
      fontWeight: 800,
    },
    messageText: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 650,
    },
    askForm: {
      display: "grid",
      gridTemplateColumns: isArabic ? "auto minmax(0, 1fr)" : "minmax(0, 1fr) auto",
      gap: "12px",
      alignItems: "end",
      marginTop: "16px",
    },
    textarea: {
      width: "100%",
      minHeight: "58px",
      maxHeight: "150px",
      resize: "vertical",
      border: "none",
      outline: "none",
      borderRadius: "22px",
      padding: "16px 18px",
      color: "#27187e",
      background: "rgba(241, 242, 246, 0.94)",
      fontSize: "14px",
      fontWeight: 650,
      lineHeight: 1.6,
      boxShadow: "inset 0 0 0 1px rgba(174,184,254,.35)",
      fontFamily: "inherit",
      gridColumn: isArabic ? 2 : 1,
      gridRow: 1,
    },
    primaryButton: {
      ...buttonBase,
      minWidth: "132px",
      height: "58px",
      gridColumn: isArabic ? 1 : 2,
      gridRow: 1,
    },
    errorMessage: {
      margin: "10px 0 0",
      color: "#ff8600",
      fontSize: "12px",
      fontWeight: 800,
    },
    quickDesc: {
      margin: "0 0 18px",
      color: "#05014d",
      fontSize: "14px",
      lineHeight: 1.8,
      fontWeight: 650,
    },
    suggestions: {
      display: "grid",
      gap: "12px",
      margin: "8px 0 22px",
    },
    suggestionButton: {
      width: "100%",
      border: "1px solid rgba(174,184,254,.6)",
      outline: "none",
      cursor: "pointer",
      textAlign: "inherit",
      borderRadius: "18px",
      padding: "14px 16px",
      color: "#27187e",
      background: "rgba(241, 242, 246, 0.68)",
      fontSize: "13px",
      fontWeight: 800,
      fontFamily: "inherit",
    },
    primaryLinkButton: {
      ...buttonBase,
      width: "fit-content",
      marginTop: "auto",
    },
  };
}
