# AI Learner — Frontend Dashboard Shell

The Learner side is currently just a "Coming Soon" placeholder at `/learner`. I'll build it as a full dashboard that mirrors the Tutor shell — same layout pattern, same shadcn + gradient styling, same `// TODO:` markers, all mock data.

## Shared shell

- New `LearnerLayout` component (same 260px fixed sidebar + top header + scrollable main as `TutorLayout`), with a learner-tinted gradient accent so the two roles feel distinct but related.
- New `LearnerSidebarNav` with brand, nav items, and a learner avatar + logout at the bottom.
- Reuse `StatCard`, `AuthShell`, shadcn primitives, and `recharts`.
- Extend `src/data/mockData.ts` with learner-side fixtures (enrolled courses, AI tutors, chat threads, assignments, quizzes, progress series, weaknesses, resources, notifications, profile).

## Routes & pages

Convert the current `/learner` placeholder into a layout route, then add child routes:

1. **`/learner` — Overview**
   Welcome banner with streak, stat cards (Courses Enrolled, Hours Studied, Avg Score, XP / Level), "Continue Learning" course card, today's tasks, recent AI tutor sessions, recommended next lesson.

2. **`/learner/courses` — My Courses**
   Grid of enrolled course cards: title, tutor name, progress bar, next module, status badge. "Browse Catalog" CTA (dialog placeholder).

3. **`/learner/tutors` — AI Tutors**
   Cards of available Digital Twin tutors (subject, style, tone, sample prompt), "Start Session" button → routes to `/learner/sessions`. `// TODO: connect to AI model`.

4. **`/learner/sessions` — AI Tutor Chat**
   Two-pane layout: left = list of past sessions; right = mock chat transcript with input box, "Ask AI" button, suggested follow-ups, attach-resource button. `// TODO: connect to AI model`.

5. **`/learner/assignments` — Assignments**
   Tabs: To Do / Submitted / Graded. Assignment cards with course, due date, status, grade, "Open" / "Submit" buttons (no-op).

6. **`/learner/quizzes` — Quizzes**
   Table: title, course, questions, best score, attempts, status. "Start Quiz" button opens a placeholder dialog with one sample question. `// TODO: connect to backend API`.

7. **`/learner/progress` — My Progress**
   Stat row (Mastery %, Streak, Time on Task, XP). Recharts line chart "Mastery over time" and bar chart "Score by subject". Achievements/badges row.

8. **`/learner/weaknesses` — Weak Spots**
   Personal weakness analysis: list of topics ranked by gap, recommended practice cards, "Generate practice set" CTA. `// TODO: connect to AI analysis pipeline`.

9. **`/learner/resources` — Library**
   Searchable list of course resources (PDF / Video / Notes / Link) with type badges and "Open" / "Bookmark" actions.

10. **`/learner/ask` — Ask a Tutor**
    Form to send a question to a human/AI tutor: subject, course, question textarea, attachment placeholder, "AI suggested answer" preview card. Inbox of past questions with status badges. `// TODO: connect to backend API` + `// TODO: connect to AI model`.

11. **`/learner/settings`**
    Profile, Account & Security, Notifications (toggles), Learning Preferences (preferred style, difficulty slider, daily goal), Billing placeholder, Danger Zone. Save buttons no-op.

## Out of scope

- Real auth, persistence, file upload, or AI calls (matches original spec).
- Changes to existing tutor pages.

## Verification

Build check + Playwright spot-check on `/learner` and one or two sub-routes.
