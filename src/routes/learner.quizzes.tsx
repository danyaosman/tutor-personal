import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { edQuizQuestions } from "../data/mockData";
import { EduFooter, LanguageToggle, useEduLang } from "../lib/edumindUi";

export const Route = createFileRoute("/learner/quizzes")({
  component: LearnerQuizzesPage,
});

type QuizQuestion = {
  id: number;
  topic: string;
  question: string;
  type: "choice" | "free-text";
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
};

type QuizReviewItem = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  type: QuizQuestion["type"];
};

const freeTextQuestions: QuizQuestion[] = [
  {
    id: 101,
    topic: "Normalization",
    type: "free-text",
    question: "In one sentence, why do we use normalization in databases?",
    correctAnswer: "To reduce redundancy",
    acceptedAnswers: [
      "reduce redundancy",
      "reduces redundancy",
      "avoid duplication",
      "avoid duplicate data",
      "remove duplicate data",
      "organize data",
      "تقليل التكرار",
      "منع التكرار",
      "تنظيم البيانات",
    ],
    explanation:
      "Normalization is used to organize data and reduce repeated or duplicated data.",
  },
  {
    id: 102,
    topic: "ERD",
    type: "free-text",
    question: "Write one example of an entity that can appear in an ERD.",
    correctAnswer: "Student",
    acceptedAnswers: [
      "student",
      "course",
      "tutor",
      "teacher",
      "learner",
      "customer",
      "order",
      "product",
      "book",
      "طالب",
      "كورس",
      "مدرس",
      "مستخدم",
    ],
    explanation:
      "An entity is a real-world object such as Student, Course, Tutor, Customer, or Order.",
  },
];

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function checkFreeTextAnswer(answer: string, question: QuizQuestion) {
  const normalizedAnswer = normalizeAnswer(answer);

  const acceptedAnswers = [
    question.correctAnswer,
    ...(question.acceptedAnswers || []),
  ].map(normalizeAnswer);

  return acceptedAnswers.some((acceptedAnswer) =>
    normalizedAnswer.includes(acceptedAnswer)
  );
}

function LearnerQuizzesPage() {
  const { lang, setLang, dir, isArabic } = useEduLang();

  const questions: QuizQuestion[] = [
    ...edQuizQuestions.map((question) => ({
      ...question,
      type: "choice" as const,
    })),
    ...freeTextQuestions,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reviewItems, setReviewItems] = useState<QuizReviewItem[]>([]);

  const currentQuestion = questions[currentIndex];
  const isFreeTextQuestion = currentQuestion?.type === "free-text";
  const options = currentQuestion?.options || [];

  function isCurrentAnswerCorrect() {
    if (!currentQuestion) {
      return false;
    }

    if (currentQuestion.type === "free-text") {
      return checkFreeTextAnswer(currentAnswer, currentQuestion);
    }

    return currentAnswer === currentQuestion.correctAnswer;
  }

  function handleNext() {
    if (!currentQuestion || !currentAnswer.trim()) {
      return;
    }

    const isCorrect = isCurrentAnswerCorrect();
    const nextScore = score + (isCorrect ? 1 : 0);

    const nextReviewItem: QuizReviewItem = {
      question: currentQuestion.question,
      userAnswer: currentAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation,
      type: currentQuestion.type,
    };

    setScore(nextScore);
    setReviewItems((items) => [...items, nextReviewItem]);

    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setCurrentAnswer("");
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setCurrentAnswer("");
    setScore(0);
    setFinished(false);
    setReviewItems([]);
  }

  const finalScore =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const t = {
    dashboard: isArabic ? "لوحة المتعلم" : "Dashboard",
    courses: isArabic ? "الكورسات" : "Courses",
    ask: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    quizzes: isArabic ? "الاختبارات" : "Quizzes",
    weaknesses: isArabic ? "نقاط الضعف" : "Weaknesses",
    logout: isArabic ? "تسجيل الخروج" : "Logout",

    badge: isArabic ? "اختبار تفاعلي" : "Interactive Quiz",
    title: isArabic
      ? "اختبر فهمك واكتشف نقاط ضعفك"
      : "Test your understanding and find weak points",
    desc: isArabic
      ? "أجب عن أسئلة اختيارية وأسئلة كتابة قصيرة، ثم راجع نتيجتك والمواضيع التي تحتاج إلى شرح إضافي."
      : "Answer multiple-choice and short free-text questions, then review your score and weak topics.",

    question: isArabic ? "السؤال" : "Question",
    from: isArabic ? "من" : "of",
    next: isArabic ? "التالي" : "Next",
    finish: isArabic ? "إنهاء الاختبار" : "Finish Quiz",
    choose: isArabic ? "اختر أو اكتب إجابة للمتابعة" : "Choose or write an answer to continue",
    result: isArabic ? "نتيجة الاختبار" : "Quiz Result",
    yourScore: isArabic ? "نتيجتك" : "Your Score",
    correct: isArabic ? "إجابات صحيحة" : "Correct answers",
    restart: isArabic ? "إعادة الاختبار" : "Restart Quiz",
    reviewWeaknesses: isArabic ? "راجع نقاط ضعفك" : "Review Weaknesses",
    askAI: isArabic ? "اسأل المدرّس الذكي" : "Ask AI Tutor",
    textAnswer: isArabic ? "إجابتك" : "Your answer",
    freeTextPlaceholder: isArabic
      ? "اكتب إجابة قصيرة هنا..."
      : "Write a short answer here...",
    freeTextHint: isArabic
      ? "ملاحظة: حالياً يتم تقييم السؤال الكتابي بالكلمات المفتاحية فقط إلى أن يتم ربطه بالـ backend أو AI."
      : "Note: free-text answers are currently checked by keywords until backend or AI grading is connected.",
    questionType: isArabic ? "نوع السؤال" : "Question type",
    multipleChoice: isArabic ? "اختياري" : "Multiple choice",
    freeText: isArabic ? "كتابة قصيرة" : "Free text",
    reviewAnswers: isArabic ? "مراجعة الإجابات" : "Answer Review",
    yourAnswer: isArabic ? "إجابتك" : "Your answer",
    expectedAnswer: isArabic ? "الإجابة المتوقعة" : "Expected answer",
    explanation: isArabic ? "التفسير" : "Explanation",
    right: isArabic ? "صحيح" : "Correct",
    wrong: isArabic ? "غير صحيح" : "Incorrect",
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

        {!finished && currentQuestion ? (
          <section className="em-dashboard-grid">
            <div className="em-panel">
              <div className="em-panel-head">
                <div>
                  <span>
                    {t.question} {currentIndex + 1} {t.from} {questions.length}
                  </span>
                  <h2>{currentQuestion.question}</h2>
                </div>
              </div>

              {isFreeTextQuestion ? (
                <div>
                  <label className="em-wide-field" style={{ marginTop: 0 }}>
                    {t.textAnswer}
                    <textarea
                      value={currentAnswer}
                      onChange={(event) => setCurrentAnswer(event.target.value)}
                      placeholder={t.freeTextPlaceholder}
                    />
                  </label>

                  <p className="em-builder-copy">{t.freeTextHint}</p>
                </div>
              ) : (
                <div className="em-result-list" style={{ gap: "10px" }}>
                  {options.map((option) => {
                    const isSelected = currentAnswer === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCurrentAnswer(option)}
                        className="em-course-card"
                        style={{
                          width: "100%",
                          minHeight: "56px",
                          padding: "14px 16px",
                          cursor: "pointer",
                          textAlign: isArabic ? "right" : "left",
                          border: isSelected
                            ? "2px solid #ff8600"
                            : "1px solid rgba(174, 184, 254, 0.55)",
                          background: isSelected
                            ? "rgba(255, 134, 0, 0.16)"
                            : "rgba(241, 242, 246, 0.46)",
                        }}
                      >
                        <strong style={{ fontSize: "14px" }}>{option}</strong>
                      </button>
                    );
                  })}
                </div>
              )}

              {!currentAnswer.trim() && (
                <p className="em-builder-copy">{t.choose}</p>
              )}

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
                <span>{currentQuestion.topic}</span>
                <span>
                  {t.questionType}: {isFreeTextQuestion ? t.freeText : t.multipleChoice}
                </span>
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

            <div className="em-panel-head em-space-top">
              <div>
                <span>{t.reviewAnswers}</span>
                <h2>{isArabic ? "تفاصيل إجاباتك" : "Your answer details"}</h2>
              </div>
            </div>

            <div className="em-course-list">
              {reviewItems.map((item, index) => (
                <article key={`${item.question}-${index}`} className="em-course-card">
                  <div className="em-card-topline">
                    <span>{item.type === "free-text" ? t.freeText : t.multipleChoice}</span>
                    <small className={item.isCorrect ? "em-success-pill" : "em-danger-pill"}>
                      {item.isCorrect ? t.right : t.wrong}
                    </small>
                  </div>

                  <h3>{item.question}</h3>
                  <p>
                    <strong>{t.yourAnswer}: </strong>
                    {item.userAnswer}
                  </p>
                  <p>
                    <strong>{t.expectedAnswer}: </strong>
                    {item.correctAnswer}
                  </p>
                  <p>
                    <strong>{t.explanation}: </strong>
                    {item.explanation}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}
