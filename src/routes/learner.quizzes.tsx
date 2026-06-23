import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { edQuizQuestions } from "../data/mockData";

export const Route = createFileRoute("/learner/quizzes")({
  component: LearnerQuizPage,
});

function LearnerQuizPage() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = edQuizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / edQuizQuestions.length) * 100;

  function selectAnswer(answer: string) {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  }

  function submitQuiz() {
    let correctCount = 0;
    const weakTopics: string[] = [];

    edQuizQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount += 1;
      } else {
        weakTopics.push(question.topic);
      }
    });

    const result = {
      score: Math.round((correctCount / edQuizQuestions.length) * 100),
      correctCount,
      totalQuestions: edQuizQuestions.length,
      answers,
      weakTopics: Array.from(new Set(weakTopics)),
    };

    localStorage.setItem("edumind_quiz_result", JSON.stringify(result));
    navigate({ to: "/learner/weaknesses" });
  }

  return (
    <main className="em-app-page">
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-app-shell">
        <nav className="em-app-nav">
          <Link to="/" className="em-app-logo">
            EduMind
          </Link>

          <div>
            <Link to="/learner">Dashboard</Link>
            <Link to="/learner/courses">Courses</Link>
            <Link to="/learner/ask">Ask AI</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-quiz-hero">
          <div>
            <span>Course Quiz</span>
            <h1>Test your understanding</h1>
            <p>
              Answer the quiz questions and EduMind will identify the topics you
              need to improve.
            </p>
          </div>
        </header>

        <section className="em-quiz-layout">
          <aside className="em-quiz-side">
            <span>Database Systems</span>
            <h2>Quiz Progress</h2>

            <div className="em-progress-ring">
              <strong>
                {currentIndex + 1}/{edQuizQuestions.length}
              </strong>
              <p>Questions</p>
            </div>

            <div className="em-quiz-progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>

            <p>
              Complete the quiz to discover your weak topics and ask the AI Tutor
              for explanations.
            </p>
          </aside>

          <section className="em-quiz-card-premium">
            <div className="em-question-top">
              <span>Question {currentIndex + 1}</span>
              <small>{currentQuestion.topic}</small>
            </div>

            <h2>{currentQuestion.question}</h2>

            <div className="em-answer-list">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    answers[currentQuestion.id] === option ? "selected" : ""
                  }
                  onClick={() => selectAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="em-quiz-actions">
              <button
                type="button"
                className="em-btn em-btn-soft"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                Previous
              </button>

              {currentIndex < edQuizQuestions.length - 1 ? (
                <button
                  type="button"
                  className="em-btn em-btn-primary"
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  className="em-btn em-btn-primary"
                  onClick={submitQuiz}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}