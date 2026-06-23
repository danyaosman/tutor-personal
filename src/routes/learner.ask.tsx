import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { edCourses } from "../data/mockData";

type ChatMessage = {
  sender: "learner" | "ai";
  text: string;
  source?: string;
};

export const Route = createFileRoute("/learner/ask")({
  component: LearnerAskPage,
});

function LearnerAskPage() {
  const course = edCourses[0];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hi! I am ${course.tutorName}'s Digital Twin. Ask me anything about ${course.name}.`,
      source: course.resource,
    },
  ]);

  function sendMessage() {
    if (!message.trim()) return;

    const learnerMessage: ChatMessage = {
      sender: "learner",
      text: message,
    };

    const aiMessage: ChatMessage = {
      sender: "ai",
      text:
        "Based on the uploaded course material, this topic can be explained step by step. First, understand the main idea, then connect it with a simple example from the course.",
      source: course.resource,
    };

    setMessages([...messages, learnerMessage, aiMessage]);
    setMessage("");
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
            <Link to="/learner/quizzes">Quiz</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero em-chat-hero">
          <div>
            <span>AI Tutor Chat</span>
            <h1>Ask the tutor’s Digital Twin</h1>
            <p>
              Chat with the AI Tutor and get answers based on the tutor’s
              uploaded course resources.
            </p>
          </div>
        </header>

        <section className="em-chat-layout">
          <div className="em-chat-panel">
            <div className="em-chat-top">
              <div>
                <span>Digital Twin</span>
                <h2>{course.tutorName}</h2>
                <p>{course.name}</p>
              </div>

              <small>Source-based answers</small>
            </div>

            <div className="em-chat-box-premium">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === "learner"
                      ? "em-chat-bubble em-user-bubble"
                      : "em-chat-bubble em-ai-bubble"
                  }
                >
                  <p>{msg.text}</p>

                  {msg.sender === "ai" && msg.source && (
                    <span>Source: {msg.source}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="em-chat-input-premium">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Ask your AI Tutor..."
              />

              <button type="button" className="em-btn em-btn-primary" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>

          <aside className="em-chat-side">
            <div className="em-panel-head">
              <div>
                <span>Suggested Questions</span>
                <h2>Start here</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMessage("Explain normalization in a simple way.")}
            >
              Explain normalization in a simple way.
            </button>

            <button
              type="button"
              onClick={() => setMessage("Give me a real-life ERD example.")}
            >
              Give me a real-life ERD example.
            </button>

            <button
              type="button"
              onClick={() => setMessage("What should I review before the quiz?")}
            >
              What should I review before the quiz?
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}