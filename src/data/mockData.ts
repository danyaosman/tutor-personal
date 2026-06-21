// TODO: replace with real data from backend API

export const tutorProfile = {
  name: "Dr. Maya Chen",
  email: "maya.chen@aitutor.io",
  subject: "Computer Science",
  avatarInitials: "MC",
};

export const overviewStats = [
  { label: "Total Students", value: "248", delta: "+12 this week", tone: "blue" as const },
  { label: "Active Courses", value: "6", delta: "2 in draft", tone: "purple" as const },
  { label: "Pending Assignments", value: "34", delta: "8 overdue", tone: "warning" as const },
  { label: "Quizzes Submitted", value: "1,204", delta: "+86 today", tone: "cyan" as const },
  { label: "Avg. Performance", value: "82%", delta: "+3.4% vs last month", tone: "success" as const },
  { label: "AI Processing", value: "Healthy", delta: "3 jobs running", tone: "blue" as const },
];

export const performanceData = [
  { week: "W1", score: 68 },
  { week: "W2", score: 71 },
  { week: "W3", score: 74 },
  { week: "W4", score: 70 },
  { week: "W5", score: 78 },
  { week: "W6", score: 81 },
  { week: "W7", score: 79 },
  { week: "W8", score: 84 },
];

export const recentActivity = [
  { name: "Alex Rivera", action: "submitted Quiz 3 — Data Structures", time: "2m ago" },
  { name: "Priya Shah", action: "asked Digital Twin a question on recursion", time: "18m ago" },
  { name: "Jordan Lee", action: "completed Assignment 2", time: "1h ago" },
  { name: "Sofia Müller", action: "started Course: Intro to ML", time: "3h ago" },
  { name: "Kenji Tanaka", action: "uploaded reflection notes", time: "Yesterday" },
];

export const upcomingTasks = [
  { title: "Review 8 pending assignments", due: "Today" },
  { title: "Publish Week 6 quiz", due: "Tomorrow" },
  { title: "Update syllabus for CS-201", due: "Fri" },
  { title: "Respond to 3 student requests", due: "Mon" },
];

export const courses = [
  {
    id: "c1",
    title: "Intro to Machine Learning",
    description: "Foundations of supervised and unsupervised learning with hands-on projects.",
    students: 84,
    resources: 23,
    status: "Active" as const,
  },
  {
    id: "c2",
    title: "Data Structures & Algorithms",
    description: "Classic DSA with problem-solving sessions and weekly contests.",
    students: 62,
    resources: 31,
    status: "Active" as const,
  },
  {
    id: "c3",
    title: "Web Development Bootcamp",
    description: "From HTML to full-stack React with project-based learning.",
    students: 58,
    resources: 47,
    status: "Active" as const,
  },
  {
    id: "c4",
    title: "Advanced NLP",
    description: "Transformers, RAG, and modern LLM applications.",
    students: 0,
    resources: 8,
    status: "Draft" as const,
  },
  {
    id: "c5",
    title: "Intro to Python (2024)",
    description: "Archived prior cohort of the Python fundamentals course.",
    students: 44,
    resources: 18,
    status: "Archived" as const,
  },
];

export type ResourceType = "PDF" | "Video" | "Audio" | "Link" | "Notes";
export type ResourceStatus = "Pending" | "Processing" | "Processed" | "Failed";

export const resources: {
  id: string;
  name: string;
  type: ResourceType;
  course: string;
  status: ResourceStatus;
  updated: string;
}[] = [
  { id: "r1", name: "Lecture 4 — Gradient Descent.pdf", type: "PDF", course: "Intro to ML", status: "Processed", updated: "2h ago" },
  { id: "r2", name: "Recursion deep-dive.mp4", type: "Video", course: "DSA", status: "Processing", updated: "10m ago" },
  { id: "r3", name: "REST APIs cheatsheet", type: "Notes", course: "Web Dev", status: "Processed", updated: "Yesterday" },
  { id: "r4", name: "Transformer paper (Vaswani 2017)", type: "Link", course: "Advanced NLP", status: "Pending", updated: "3 days ago" },
  { id: "r5", name: "Office-hours Q&A.m4a", type: "Audio", course: "Intro to ML", status: "Failed", updated: "1 day ago" },
  { id: "r6", name: "Sorting algorithms.pdf", type: "PDF", course: "DSA", status: "Processed", updated: "5 days ago" },
  { id: "r7", name: "React hooks walkthrough.mp4", type: "Video", course: "Web Dev", status: "Processed", updated: "1 week ago" },
  { id: "r8", name: "Probability primer.pdf", type: "PDF", course: "Intro to ML", status: "Processing", updated: "30m ago" },
];

// ---------- Syllabus & Goals ----------
export const syllabi = [
  {
    course: "Intro to Machine Learning",
    modules: [
      { title: "Foundations & Linear Regression", weeks: "Wk 1–2", status: "Completed" as const },
      { title: "Classification & Logistic Models", weeks: "Wk 3–4", status: "Completed" as const },
      { title: "Trees, Forests & Boosting", weeks: "Wk 5–6", status: "In Progress" as const },
      { title: "Neural Networks Primer", weeks: "Wk 7–8", status: "Planned" as const },
      { title: "Unsupervised Learning", weeks: "Wk 9–10", status: "Planned" as const },
    ],
  },
  {
    course: "Data Structures & Algorithms",
    modules: [
      { title: "Arrays, Strings & Hashing", weeks: "Wk 1–2", status: "Completed" as const },
      { title: "Linked Lists & Stacks", weeks: "Wk 3", status: "In Progress" as const },
      { title: "Trees & Graphs", weeks: "Wk 4–5", status: "Planned" as const },
      { title: "Dynamic Programming", weeks: "Wk 6–7", status: "Planned" as const },
    ],
  },
];

export const learningGoals = [
  { title: "85% average quiz score by end of term", progress: 72 },
  { title: "Every student completes 4 projects", progress: 58 },
  { title: "Reduce at-risk students below 10%", progress: 64 },
  { title: "Publish 6 AI-graded assignments", progress: 83 },
];

// ---------- Quizzes ----------
export const quizzes = [
  { id: "q1", title: "Gradient Descent Basics", course: "Intro to ML", questions: 12, attempts: 84, avg: 78, status: "Published" as const },
  { id: "q2", title: "Recursion Patterns", course: "DSA", questions: 10, attempts: 62, avg: 71, status: "Published" as const },
  { id: "q3", title: "React Hooks Deep-Dive", course: "Web Dev", questions: 15, attempts: 51, avg: 84, status: "Published" as const },
  { id: "q4", title: "Transformers Intro", course: "Advanced NLP", questions: 8, attempts: 0, avg: 0, status: "Draft" as const },
  { id: "q5", title: "Big-O Sprint", course: "DSA", questions: 20, attempts: 47, avg: 66, status: "Published" as const },
  { id: "q6", title: "Probability Refresher", course: "Intro to ML", questions: 10, attempts: 12, avg: 0, status: "Scheduled" as const },
];

// ---------- Assignments ----------
export const assignments = [
  { id: "a1", title: "Build a Linear Regressor", course: "Intro to ML", due: "Jun 24", submitted: 62, total: 84, graded: 40, state: "Active" as const },
  { id: "a2", title: "Implement LRU Cache", course: "DSA", due: "Jun 26", submitted: 48, total: 62, graded: 31, state: "Active" as const },
  { id: "a3", title: "Portfolio Site (React)", course: "Web Dev", due: "Jun 30", submitted: 22, total: 58, graded: 10, state: "Active" as const },
  { id: "a4", title: "Sentiment Classifier", course: "Advanced NLP", due: "—", submitted: 0, total: 0, graded: 0, state: "Drafts" as const },
  { id: "a5", title: "Sorting Showdown", course: "DSA", due: "May 12", submitted: 60, total: 62, graded: 62, state: "Archived" as const },
  { id: "a6", title: "EDA on Titanic", course: "Intro to ML", due: "May 30", submitted: 80, total: 84, graded: 84, state: "Archived" as const },
];

// ---------- Analytics ----------
export const analyticsStats = [
  { label: "Avg. Score", value: "82%", delta: "+3.4% MoM", tone: "success" as const },
  { label: "Engagement", value: "74%", delta: "+5% this week", tone: "blue" as const },
  { label: "Completion", value: "68%", delta: "+1.2%", tone: "purple" as const },
  { label: "At-Risk Students", value: "19", delta: "-4 vs last term", tone: "warning" as const },
];

export const engagementTrend = [
  { week: "W1", engagement: 55 },
  { week: "W2", engagement: 62 },
  { week: "W3", engagement: 60 },
  { week: "W4", engagement: 68 },
  { week: "W5", engagement: 71 },
  { week: "W6", engagement: 70 },
  { week: "W7", engagement: 74 },
  { week: "W8", engagement: 78 },
];

export const coursePerformance = [
  { course: "Intro to ML", score: 82 },
  { course: "DSA", score: 74 },
  { course: "Web Dev", score: 88 },
  { course: "NLP", score: 70 },
  { course: "Python", score: 79 },
];

export const topStudents = [
  { name: "Alex Rivera", course: "DSA", score: 96, trend: "up" as const },
  { name: "Priya Shah", course: "Intro to ML", score: 94, trend: "up" as const },
  { name: "Jordan Lee", course: "Web Dev", score: 92, trend: "flat" as const },
];

export const strugglingStudents = [
  { name: "Sofia Müller", course: "Advanced NLP", score: 54, trend: "down" as const },
  { name: "Kenji Tanaka", course: "DSA", score: 58, trend: "down" as const },
  { name: "Liam O'Connor", course: "Intro to ML", score: 61, trend: "flat" as const },
];

// ---------- Weakness Analysis ----------
export const weaknessTopics = [
  { topic: "Recursion", beginner: 20, intermediate: 55, advanced: 78 },
  { topic: "Backpropagation", beginner: 35, intermediate: 60, advanced: 82 },
  { topic: "Big-O Analysis", beginner: 15, intermediate: 42, advanced: 70 },
  { topic: "CSS Layout", beginner: 25, intermediate: 38, advanced: 55 },
  { topic: "Probability", beginner: 30, intermediate: 50, advanced: 74 },
  { topic: "Async/Await", beginner: 22, intermediate: 48, advanced: 66 },
];

export const topWeakTopics = [
  { topic: "Recursion (Advanced)", affected: 42, action: "Generate targeted practice set" },
  { topic: "Backpropagation", affected: 31, action: "Add visual walkthrough resource" },
  { topic: "Big-O Analysis", affected: 28, action: "Schedule live review session" },
  { topic: "Probability — Bayes", affected: 24, action: "Push concept refresher quiz" },
  { topic: "CSS Grid", affected: 18, action: "Share interactive playground" },
];

// ---------- Requests ----------
export const studentRequests = [
  { id: "rq1", name: "Alex Rivera", initials: "AR", course: "DSA", preview: "Can you explain when to use BFS over DFS for shortest path?", time: "5m ago", status: "New" as const,
    body: "I'm working through the graphs module and I keep getting tripped up on when BFS is better than DFS for shortest path problems. The lecture mentioned unweighted graphs but I'd love a worked example." },
  { id: "rq2", name: "Priya Shah", initials: "PS", course: "Intro to ML", preview: "My gradient descent diverges — what should I check first?", time: "32m ago", status: "New" as const,
    body: "When I run my regressor on the housing dataset the loss explodes after a few epochs. I think it's the learning rate but not sure how to pick a good starting value." },
  { id: "rq3", name: "Jordan Lee", initials: "JL", course: "Web Dev", preview: "Best way to structure shared state in a small React app?", time: "2h ago", status: "Replied" as const,
    body: "Should I reach for Zustand, context, or just lift state? My app has 5 screens and a settings panel." },
  { id: "rq4", name: "Sofia Müller", initials: "SM", course: "Advanced NLP", preview: "Could you recommend a starter paper for retrieval-augmented generation?", time: "Yesterday", status: "Resolved" as const,
    body: "I'd like to write my term project on RAG and I want a foundational read before the Vaswani paper." },
  { id: "rq5", name: "Kenji Tanaka", initials: "KT", course: "DSA", preview: "Stuck on the LRU cache assignment.", time: "Yesterday", status: "Replied" as const,
    body: "My implementation works but it's O(n) on get. I think I need a doubly linked list — can you confirm before I rewrite?" },
];

// ---------- Settings ----------
export const notificationDefaults = {
  studentSubmissions: true,
  newRequests: true,
  weeklyReport: true,
  productUpdates: false,
};

export const aiPreferenceDefaults = {
  autoGradeShortAnswer: true,
  suggestReplies: true,
  weeklyInsights: true,
  shareAnonData: false,
};
