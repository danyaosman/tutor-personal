import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { edCourses } from "../data/mockData";

export const Route = createFileRoute("/learner/courses")({
  component: LearnerCoursesPage,
});

function LearnerCoursesPage() {
  const [search, setSearch] = useState("");

  const filteredCourses = edCourses.filter((course) => {
    const content = `${course.name} ${course.subject} ${course.grade} ${course.tutorName}`;
    return content.toLowerCase().includes(search.toLowerCase());
  });

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
            <Link to="/learner/ask">Ask AI</Link>
            <Link to="/learner/quizzes">Quiz</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero">
          <div>
            <span>Course Library</span>
            <h1>Find a course and start learning</h1>
            <p>
              Browse available courses, join the right learning space, and study
              with the tutor’s Digital Twin.
            </p>
          </div>
        </header>

        <section className="em-panel em-course-library">
          <div className="em-panel-head em-search-head">
            <div>
              <span>Available Courses</span>
              <h2>Choose your course</h2>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="em-search-input"
            />
          </div>

          <div className="em-library-grid">
            {filteredCourses.map((course) => (
              <article key={course.id} className="em-course-card em-library-card">
                <div className="em-card-topline">
                  <span>{course.subject}</span>
                  <small>{course.grade}</small>
                </div>

                <h3>{course.name}</h3>

                <p>{course.description}</p>

                <div className="em-pill-row">
                  <span>{course.tutorName}</span>
                  <span>{course.learners} learners</span>
                  <span>{course.averageScore}% avg</span>
                </div>

                <div className="em-learner-actions">
                  <Link to="/learner/ask" className="em-btn em-btn-primary">
                    Join / Open
                  </Link>

                  <Link to="/learner/quizzes" className="em-btn em-btn-soft">
                    Take Quiz
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}