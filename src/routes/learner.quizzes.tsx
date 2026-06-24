import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { edQuizQuestions } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/quizzes")({
  component: LearnerQuizzesPage,
});

function LearnerQuizzesPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const questions = edQuizQuestions as Array<Record<string, any>>;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex] || {};
  const options =
    currentQuestion.options ||
    currentQuestion.answers ||
    (isArabic
      ? ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"]
      : ["First option", "Second option", "Third option", "Fourth option"]);

  const correctAnswer =
    currentQuestion.correctAnswer || currentQuestion.answer || options[0];

  function handleNext() {
    if (!selectedAnswer) {
      return;
    }

    if (selectedAnswer === correctAnswer) {
      setScore((currentScore) => currentScore + 1);
    }

    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer("");
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  }

  const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "اختبار تفاعلي" : "Interactive Quiz",
    title: isArabic ? "اختبر فهمك واكتشف نقاط ضعفك" : "Test your understanding and find weak points",
    desc: isArabic
      ? "أجب عن الأسئلة، ثم راجع نتيجتك والمواضيع التي تحتاج إلى شرح إضافي."
      : "Answer the questions, then review your score and the topics that need extra explanation.",

    question: isArabic ? "السؤال" : "Question",
    from: isArabic ? "من" : "of",
    next: isArabic ? "التالي" : "Next",
    finish: isArabic ? "إنهاء الاختبار" : "Finish Quiz",
    choose: isArabic ? "اختر إجابة للمتابعة" : "Choose an answer to continue",
    result: isArabic ? "نتيجة الاختبار" : "Quiz Result",
    yourScore: isArabic ? "نتيجتك" : "Your Score",
    correct: isArabic ? "إجابات صحيحة" : "Correct answers",
    restart: isArabic ? "إعادة الاختبار" : "Restart Quiz",
    reviewWeaknesses: isArabic ? "راجع نقاط ضعفك" : "Review Weaknesses",
    askAI: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
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
        </header>

        {!finished ? (
          <section className="em-dashboard-grid">
            <div className="em-panel">
              <div className="em-panel-head">
                <div>
                  <span>
                    {t.question} {currentIndex + 1} {t.from} {questions.length}
                  </span>
                  <h2>
                    {currentQuestion.question ||
                      currentQuestion.title ||
                      (isArabic
                        ? "ما الإجابة الصحيحة لهذا السؤال؟"
                        : "What is the correct answer for this question?")}
                  </h2>
                </div>
              </div>

              <div className="em-result-list">
                {options.map((option: string) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      selectedAnswer === option
                        ? "em-choice-card em-stat-orange"
                        : "em-choice-card"
                    }
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <strong>{option}</strong>
                  </button>
                ))}
              </div>

              {!selectedAnswer && <p className="em-builder-copy">{t.choose}</p>}

              <button
                type="button"
                onClick={handleNext}
                className="em-btn em-btn-primary em-full-btn"
              >
                {currentIndex === questions.length - 1 ? t.finish : t.next}
              </button>
            </div>

            <div className="em-panel">
              <div className="em-panel-head">
                <div>
                  <span>{isArabic ? "تقدم الاختبار" : "Quiz Progress"}</span>
                  <h2>
                    {currentIndex + 1}/{questions.length}
                  </h2>
                </div>
              </div>

              <div className="em-topic-cloud">
                <span>
                  {t.correct}: {score}
                </span>
                <span>
                  {t.question}: {currentIndex + 1}
                </span>
                <span>{currentQuestion.topic || (isArabic ? "موضوع عام" : "General topic")}</span>
              </div>

              <p className="em-builder-copy">
                {isArabic
                  ? "بعد إنهاء الاختبار، ستظهر النتيجة ويمكنك الانتقال مباشرة إلى صفحة نقاط الضعف."
                  : "After finishing the quiz, your result will appear and you can move directly to the weaknesses page."}
              </p>
            </div>
          </section>
        ) : (
          <section className="em-panel em-page-enter">
            <div className="em-panel-head">
              <div>
                <span>{t.result}</span>
                <h2>{t.yourScore}</h2>
              </div>
            </div>

            <section className="em-stat-grid">
              <article className="em-stat-card em-stat-orange">
                <span>{t.yourScore}</span>
                <strong>{finalScore}%</strong>
                <p>{isArabic ? "النتيجة النهائية" : "final result"}</p>
              </article>

              <article className="em-stat-card">
                <span>{t.correct}</span>
                <strong>
                  {score}/{questions.length}
                </strong>
                <p>{isArabic ? "إجابات صحيحة" : "correct answers"}</p>
              </article>
            </section>

            <div className="em-learner-actions">
              <button type="button" onClick={restartQuiz} className="em-btn em-btn-soft">
                {t.restart}
              </button>

              <Link to="/learner/weaknesses" className="em-btn em-btn-primary">
                {t.reviewWeaknesses}
              </Link>

              <Link to="/learner/ask" className="em-btn em-btn-soft">
                {t.askAI}
              </Link>
            </div>
          </section>
        )}

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}