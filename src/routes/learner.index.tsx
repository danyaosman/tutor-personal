import { createFileRoute, Link } from "@tanstack/react-router";
import { edCourses } from "../data/mockData";

export const Route = createFileRoute("/learner/")({
  component: LearnerHomePage,
});

function LearnerHomePage() {
  const joinedCourse = edCourses[0];

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
            <Link to="/learner/quizzes">Quiz</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero">
          <div>
            <span>Learner Space</span>
            <h1>Continue learning with your AI Tutor</h1>
            <p>
              Join courses, ask questions, take quizzes, and understand the
              topics you need to improve.
            </p>
          </div>

          <Link to="/learner/courses" className="em-btn em-btn-primary">
            Explore Courses
          </Link>
        </header>

        <section className="em-stat-grid">
          <article className="em-stat-card">
            <span>Joined Courses</span>
            <strong>1</strong>
            <p>Active learning spaces</p>
          </article>

          <article className="em-stat-card">
            <span>Last Score</span>
            <strong>60%</strong>
            <p>Latest quiz result</p>
          </article>

          <article className="em-stat-card em-stat-orange">
            <span>Weak Topics</span>
            <strong>2</strong>
            <p>Topics to review</p>
          </article>

          <article className="em-stat-card">
            <span>AI Sessions</span>
            <strong>8</strong>
            <p>Saved chat messages</p>
          </article>
        </section>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>My Learning</span>
                <h2>Joined Course</h2>
              </div>
            </div>

            <article className="em-course-card">
              <div className="em-card-topline">
                <span>Joined</span>
                <small>Digital Twin Ready</small>
              </div>

              <h3>{joinedCourse.name}</h3>

              <p>{joinedCourse.description}</p>

              <div className="em-pill-row">
                <span>{joinedCourse.subject}</span>
                <span>{joinedCourse.grade}</span>
                <span>{joinedCourse.tutorName}</span>
              </div>

              <div className="em-learner-actions">
                <Link to="/learner/ask" className="em-btn em-btn-primary">
                  Ask AI Tutor
                </Link>

                <Link to="/learner/quizzes" className="em-btn em-btn-soft">
                  Take Quiz
                </Link>
              </div>
            </article>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>Focus Area</span>
                <h2>Topics to Improve</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              <span>Normalization</span>
              <span>ERD</span>
            </div>

            <div className="em-learning-note">
              <h3>Suggested next step</h3>
              <p>
                Ask the AI Tutor to explain your weak topics using simple
                examples from the course resources.
              </p>

              <Link to="/learner/ask" className="em-btn em-btn-soft">
                Ask AI About Weak Topics
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}