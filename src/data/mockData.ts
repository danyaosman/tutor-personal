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

// ===========================================================================
// LEARNER-SIDE MOCK DATA
// TODO: replace with real data from backend API
// ===========================================================================

export const learnerProfile = {
  name: "Alex Rivera",
  email: "alex.rivera@learner.io",
  avatarInitials: "AR",
  level: 7,
  xp: 4820,
  nextLevelXp: 6000,
  streak: 12,
  dailyGoalMinutes: 45,
};

export const learnerStats = [
  { label: "Courses Enrolled", value: "4", delta: "1 finishing soon", tone: "blue" as const },
  { label: "Hours Studied", value: "37h", delta: "+5h this week", tone: "cyan" as const },
  { label: "Avg. Score", value: "84%", delta: "+2% vs last week", tone: "success" as const },
  { label: "XP / Level", value: "Lvl 7", delta: "1,180 XP to Lvl 8", tone: "purple" as const },
];

export const continueLearning = {
  course: "Intro to Machine Learning",
  module: "Trees, Forests & Boosting",
  lesson: "Lesson 3 — Gradient Boosted Trees",
  progress: 62,
  tutor: "Dr. Maya Chen",
};

export const todaysTasks = [
  { title: "Finish lesson: Gradient Boosted Trees", due: "Today", kind: "Lesson" },
  { title: "Submit Assignment: Build a Linear Regressor", due: "Today", kind: "Assignment" },
  { title: "Take quiz: Recursion Patterns", due: "Tomorrow", kind: "Quiz" },
  { title: "Review weak topic: Big-O Analysis", due: "This week", kind: "Practice" },
];

export const recentSessions = [
  { id: "s1", tutor: "Dr. Maya Chen", subject: "Intro to ML", preview: "Walked through bias-variance tradeoff with examples.", time: "2h ago" },
  { id: "s2", tutor: "Prof. Diego Santos", subject: "DSA", preview: "Practiced 3 recursion problems. You got 2 on first try!", time: "Yesterday" },
  { id: "s3", tutor: "Dr. Maya Chen", subject: "Intro to ML", preview: "Explained gradient descent with a worked example.", time: "2 days ago" },
];

export const enrolledCourses = [
  { id: "lc1", title: "Intro to Machine Learning", tutor: "Dr. Maya Chen", progress: 62, nextModule: "Trees, Forests & Boosting", status: "In Progress" as const, lessons: 24, completed: 15 },
  { id: "lc2", title: "Data Structures & Algorithms", tutor: "Prof. Diego Santos", progress: 41, nextModule: "Linked Lists & Stacks", status: "In Progress" as const, lessons: 30, completed: 12 },
  { id: "lc3", title: "Web Development Bootcamp", tutor: "Sara Kim", progress: 88, nextModule: "Deploying React Apps", status: "Almost Done" as const, lessons: 40, completed: 35 },
  { id: "lc4", title: "Intro to Python (2024)", tutor: "Dr. Maya Chen", progress: 100, nextModule: "—", status: "Completed" as const, lessons: 18, completed: 18 },
];

export const aiTutors = [
  { id: "t1", name: "Dr. Maya Chen", subject: "Machine Learning", style: "Step-by-step", tone: "Encouraging", samplePrompt: "Explain backpropagation like I'm a beginner.", rating: 4.9 },
  { id: "t2", name: "Prof. Diego Santos", subject: "Algorithms", style: "Socratic", tone: "Friendly", samplePrompt: "Why is BFS better than DFS for shortest path?", rating: 4.8 },
  { id: "t3", name: "Sara Kim", subject: "Web Development", style: "Example-driven", tone: "Friendly", samplePrompt: "Show me how useEffect actually works.", rating: 4.7 },
  { id: "t4", name: "Dr. Imani Okafor", subject: "Advanced NLP", style: "Conceptual", tone: "Formal", samplePrompt: "Walk me through attention in a Transformer.", rating: 4.9 },
];

export const sessionThreads = [
  { id: "st1", title: "Gradient descent intuition", tutor: "Dr. Maya Chen", course: "Intro to ML", time: "2h ago", unread: 0 },
  { id: "st2", title: "Recursion vs iteration", tutor: "Prof. Diego Santos", course: "DSA", time: "Yesterday", unread: 1 },
  { id: "st3", title: "useEffect dependency arrays", tutor: "Sara Kim", course: "Web Dev", time: "2 days ago", unread: 0 },
  { id: "st4", title: "BFS vs DFS for shortest path", tutor: "Prof. Diego Santos", course: "DSA", time: "Last week", unread: 0 },
];

export const sampleChat = [
  { role: "tutor" as const, name: "Dr. Maya Chen", text: "Hey Alex! Want to pick up where we left off on gradient boosted trees, or start fresh on something new?", time: "10:02" },
  { role: "user" as const, name: "Alex", text: "Let's continue. Why does boosting work better than a single deep tree?", time: "10:03" },
  { role: "tutor" as const, name: "Dr. Maya Chen", text: "Great question. A single deep tree memorizes the training set and overfits. Boosting builds many shallow trees, each correcting the previous one's mistakes — so the model generalizes better. Want me to show this with a quick example on the housing dataset?", time: "10:03" },
  { role: "user" as const, name: "Alex", text: "Yes please, with code.", time: "10:04" },
];

export const suggestedFollowups = [
  "How do I tune the learning rate?",
  "What's the difference between XGBoost and LightGBM?",
  "Give me a practice problem on this.",
];

export const learnerAssignments = [
  { id: "la1", title: "Build a Linear Regressor", course: "Intro to ML", due: "Today", state: "To Do" as const, grade: null },
  { id: "la2", title: "Implement LRU Cache", course: "DSA", due: "Jun 26", state: "To Do" as const, grade: null },
  { id: "la3", title: "Portfolio Site (React)", course: "Web Dev", due: "Jun 30", state: "To Do" as const, grade: null },
  { id: "la4", title: "EDA on Titanic", course: "Intro to ML", due: "Submitted May 30", state: "Submitted" as const, grade: null },
  { id: "la5", title: "Sorting Showdown", course: "DSA", due: "Graded May 14", state: "Graded" as const, grade: 92 },
  { id: "la6", title: "Calculator App", course: "Web Dev", due: "Graded May 02", state: "Graded" as const, grade: 88 },
];

export const learnerQuizzes = [
  { id: "lq1", title: "Gradient Descent Basics", course: "Intro to ML", questions: 12, attempts: 2, best: 88, status: "Completed" as const },
  { id: "lq2", title: "Recursion Patterns", course: "DSA", questions: 10, attempts: 0, best: null, status: "Available" as const },
  { id: "lq3", title: "React Hooks Deep-Dive", course: "Web Dev", questions: 15, attempts: 1, best: 80, status: "Completed" as const },
  { id: "lq4", title: "Big-O Sprint", course: "DSA", questions: 20, attempts: 1, best: 62, status: "Retake" as const },
  { id: "lq5", title: "Probability Refresher", course: "Intro to ML", questions: 10, attempts: 0, best: null, status: "Available" as const },
];

export const masteryOverTime = [
  { week: "W1", mastery: 38 },
  { week: "W2", mastery: 45 },
  { week: "W3", mastery: 52 },
  { week: "W4", mastery: 58 },
  { week: "W5", mastery: 64 },
  { week: "W6", mastery: 68 },
  { week: "W7", mastery: 72 },
  { week: "W8", mastery: 78 },
];

export const scoreBySubject = [
  { subject: "ML", score: 84 },
  { subject: "DSA", score: 71 },
  { subject: "Web Dev", score: 91 },
  { subject: "Python", score: 95 },
];

export const achievements = [
  { title: "7-day streak", icon: "🔥", earned: true },
  { title: "Quiz Master", icon: "🏆", earned: true },
  { title: "First Project", icon: "🚀", earned: true },
  { title: "Night Owl", icon: "🦉", earned: true },
  { title: "Speed Coder", icon: "⚡", earned: false },
  { title: "Course Crusher", icon: "💪", earned: false },
];

export const learnerWeakTopics = [
  { topic: "Big-O Analysis", mastery: 38, gap: "high", action: "Generate 10-question practice set" },
  { topic: "Recursion — Backtracking", mastery: 45, gap: "high", action: "Watch 8-min visual explainer" },
  { topic: "Probability — Bayes Theorem", mastery: 52, gap: "medium", action: "Take refresher quiz" },
  { topic: "CSS Grid layouts", mastery: 58, gap: "medium", action: "Try interactive playground" },
  { topic: "Async / Await in JS", mastery: 61, gap: "low", action: "Read 5-min summary" },
];

export const learnerResources = [
  { id: "lr1", name: "Lecture 4 — Gradient Descent.pdf", type: "PDF" as const, course: "Intro to ML", bookmarked: true, updated: "2h ago" },
  { id: "lr2", name: "Recursion deep-dive.mp4", type: "Video" as const, course: "DSA", bookmarked: false, updated: "10m ago" },
  { id: "lr3", name: "REST APIs cheatsheet", type: "Notes" as const, course: "Web Dev", bookmarked: true, updated: "Yesterday" },
  { id: "lr4", name: "Transformer paper (Vaswani 2017)", type: "Link" as const, course: "Advanced NLP", bookmarked: false, updated: "3 days ago" },
  { id: "lr5", name: "Sorting algorithms.pdf", type: "PDF" as const, course: "DSA", bookmarked: false, updated: "5 days ago" },
  { id: "lr6", name: "React hooks walkthrough.mp4", type: "Video" as const, course: "Web Dev", bookmarked: true, updated: "1 week ago" },
];

export const learnerPastQuestions = [
  { id: "lq_a", subject: "Recursion vs iteration", course: "DSA", time: "Yesterday", status: "Replied" as const },
  { id: "lq_b", subject: "How do I tune the learning rate?", course: "Intro to ML", time: "2 days ago", status: "Resolved" as const },
  { id: "lq_c", subject: "Best React state management for small apps", course: "Web Dev", time: "Last week", status: "Resolved" as const },
];

export const learnerNotificationDefaults = {
  newAssignments: true,
  dueSoonReminders: true,
  tutorReplies: true,
  weeklyProgress: true,
  productUpdates: false,
};

export const learnerPreferenceDefaults = {
  preferredStyle: "Step-by-step",
  preferredTone: "Encouraging",
  difficulty: 3,
  dailyGoalMinutes: 45,
  voiceReplies: false,
  showAiSuggestions: true,
};


// EduMind UI mock data

export type EdCourse = {
  id: number;
  name: string;
  subject: string;
  grade: string;
  tutorName: string;
  description: string;
  learningGoals: string[];
  resource: string;
  learners: number;
  averageScore: number;
};

export type EdQuizQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type EdLearnerResult = {
  id: number;
  learnerName: string;
  course: string;
  score: number;
  weakTopics: string[];
  date: string;
};

export const edCourses: EdCourse[] = [
  {
    id: 1,
    name: "Database Systems",
    subject: "Computer Science",
    grade: "University Year 3",
    tutorName: "Dr. Ahmad Khaled",
    description:
      "Learn ERD, relational models, SQL basics, and normalization using simple examples.",
    learningGoals: [
      "Understand ERD components",
      "Convert ERD to relational schema",
      "Apply normalization rules",
      "Practice database design questions",
    ],
    resource: "database_normalization.pdf",
    learners: 24,
    averageScore: 76,
  },
  {
    id: 2,
    name: "Introduction to Biology",
    subject: "Biology",
    grade: "Grade 10",
    tutorName: "Ms. Lina Omar",
    description:
      "Understand cell structure, photosynthesis, and basic biology concepts with clear explanations.",
    learningGoals: [
      "Understand cell structure",
      "Explain photosynthesis",
      "Recognize weak topics through quizzes",
    ],
    resource: "biology_chapter_1.pdf",
    learners: 18,
    averageScore: 81,
  },
];

export const edQuizQuestions: EdQuizQuestion[] = [
  {
    id: 1,
    topic: "Normalization",
    question: "What is the main goal of normalization?",
    options: [
      "To duplicate data",
      "To reduce redundancy",
      "To delete all tables",
      "To make queries slower",
    ],
    correctAnswer: "To reduce redundancy",
    explanation:
      "Normalization organizes data into related tables and reduces repeated data.",
  },
  {
    id: 2,
    topic: "ERD",
    question: "What does an entity represent in an ERD?",
    options: [
      "A real-world object",
      "Only a number",
      "A password",
      "A color",
    ],
    correctAnswer: "A real-world object",
    explanation:
      "An entity represents something real in the system, such as Student, Course, or Tutor.",
  },
  {
    id: 3,
    topic: "Relational Model",
    question: "What is a primary key used for?",
    options: [
      "To identify each row uniquely",
      "To create colors",
      "To delete a database",
      "To store images only",
    ],
    correctAnswer: "To identify each row uniquely",
    explanation:
      "A primary key uniquely identifies every record in a table.",
  },
];

export const edLearnerResults: EdLearnerResult[] = [
  {
    id: 1,
    learnerName: "Sara Ali",
    course: "Database Systems",
    score: 60,
    weakTopics: ["Normalization", "ERD"],
    date: "Today",
  },
  {
    id: 2,
    learnerName: "Omar Hassan",
    course: "Database Systems",
    score: 72,
    weakTopics: ["SQL Joins"],
    date: "Yesterday",
  },
  {
    id: 3,
    learnerName: "Maya Noor",
    course: "Introduction to Biology",
    score: 55,
    weakTopics: ["Photosynthesis", "Cell Structure"],
    date: "2 days ago",
  },
];
