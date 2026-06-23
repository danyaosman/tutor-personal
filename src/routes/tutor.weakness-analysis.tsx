import { createFileRoute, Link } from "@tanstack/react-router";
import { edLearnerResults } from "../data/mockData";

export const Route = createFileRoute("/tutor/weakness-analysis")({
  component: TutorWeaknessAnalysisPage,
});

function TutorWeaknessAnalysisPage() {
  const commonWeakTopics = [
    "Normalization",
    "ERD",
    "SQL Joins",
    "Photosynthesis",
  ];

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
            <Link to="/tutor/overview">Dashboard</Link>
            <Link to="/tutor/digital-twin">Create Course</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>

        <header className="em-dashboard-hero">
          <div>
            <span>Weakness Analysis</span>
            <h1>Understand where learners struggle</h1>
            <p>
              Review quiz results, weak topics, and learner performance across
              your courses.
            </p>
          </div>
        </header>

        <section className="em-dashboard-grid">
          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>Course Insights</span>
                <h2>Common Weak Topics</h2>
              </div>
            </div>

            <div className="em-topic-cloud">
              {commonWeakTopics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          </div>

          <div className="em-panel">
            <div className="em-panel-head">
              <div>
                <span>Summary</span>
                <h2>Performance Snapshot</h2>
              </div>
            </div>

            <div className="em-mini-stat-row">
              <div>
                <strong>{edLearnerResults.length}</strong>
                <span>Recent Results</span>
              </div>

              <div>
                <strong>55%</strong>
                <span>Lowest Score</span>
              </div>

              <div>
                <strong>4</strong>
                <span>Weak Topics</span>
              </div>
            </div>
          </div>
        </section>

        <section className="em-panel em-table-panel">
          <div className="em-panel-head">
            <div>
              <span>Learner Tracking</span>
              <h2>Recent Learner Quiz Results</h2>
            </div>
          </div>

          <div className="em-table-wrapper">
            <table className="em-table-premium">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Weak Topics</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {edLearnerResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.learnerName}</td>
                    <td>{result.course}</td>
                    <td>
                      <strong>{result.score}%</strong>
                    </td>
                    <td>
                      <div className="em-table-pills">
                        {result.weakTopics.map((topic) => (
                          <span key={topic}>{topic}</span>
                        ))}
                      </div>
                    </td>
                    <td>{result.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}