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
