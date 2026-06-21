# Finish the AI Tutor Shell — Remaining Pages

The auth flow, shell, Overview, Digital Twin, Courses, Resources, and Learner placeholder are done. Seven tutor sub-pages are still rendering the generic `ComingSoonPage` placeholder. The original spec listed them in the route table but didn't detail them — I'll build each with mock data following the same shadcn + gradient style used elsewhere.

## Pages to build

1. **Syllabus & Goals** (`/tutor/syllabus`)
   - Per-course syllabus card list with modules, week ranges, status badges (Planned / In Progress / Completed)
   - Learning goals panel with progress bars
   - "Add Module" / "Add Goal" buttons (no-op + TODO comments)

2. **Quizzes** (`/tutor/quizzes`)
   - Header + "Create Quiz" button (opens placeholder Dialog)
   - Quiz table: title, course, # questions, attempts, avg score, status badge
   - "AI Generate Quiz" CTA card with TODO

3. **Assignments** (`/tutor/assignments`)
   - Tabs: Active / Drafts / Archived
   - Assignment cards: title, course, due date, submissions count, grading progress bar
   - "New Assignment" button + dialog

4. **Student Analytics** (`/tutor/analytics`)
   - Stat row (Avg score, Engagement, Completion, At-risk count) reusing `StatCard`
   - Recharts line chart "Engagement over time"
   - Recharts bar chart "Performance by course"
   - Top/struggling students table

5. **Weakness Analysis** (`/tutor/weakness-analysis`)
   - Heat-map style grid of topics × difficulty (mock cells with color intensity)
   - "Top 5 weak topics" list with recommended actions
   - Per-student weakness drilldown card
   - TODO: connect to AI analysis pipeline

6. **Requests** (`/tutor/requests`)
   - Inbox-style list: student help requests with avatar, question preview, course tag, time, status badge (New / Replied / Resolved)
   - Right-side preview pane (selected request mock)
   - Quick reply textarea + AI-suggested reply card (TODO)

7. **Settings** (`/tutor/settings`)
   - Sections: Profile, Account & Security, Notifications (toggles), AI Preferences, Billing placeholder, Danger Zone
   - Save buttons no-op with TODO comments

## Shared work

- Add mock data for each page to `src/data/mockData.ts`
- Reuse `TutorLayout`, `StatCard`, shadcn `Card`/`Badge`/`Table`/`Dialog`/`Tabs`/`Switch`/`Slider`/`Progress`
- Keep gradient + soft-shadow styling consistent with Overview
- Liberal `// TODO: connect to backend API` / `// TODO: connect to AI model` markers

## Out of scope

- Real auth, persistence, file upload, or AI calls (per original spec)
- Learner-side flows beyond the existing placeholder

After implementation I'll verify the build and spot-check a couple of pages in the preview.