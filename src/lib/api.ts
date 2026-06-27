const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "ai-tutor.access-token";
const REFRESH_TOKEN_KEY = "ai-tutor.refresh-token";

type ApiErrorPayload = {
  detail?: string;
  [key: string]: string | string[] | undefined;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: ApiErrorPayload = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function hasSession() {
  return Boolean(storage()?.getItem(REFRESH_TOKEN_KEY));
}

export function clearSession() {
  storage()?.removeItem(ACCESS_TOKEN_KEY);
  storage()?.removeItem(REFRESH_TOKEN_KEY);
}

function saveSession(tokens: AuthTokens) {
  storage()?.setItem(ACCESS_TOKEN_KEY, tokens.access);
  storage()?.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

async function parseError(response: Response) {
  let fields: ApiErrorPayload = {};
  try {
    fields = (await response.json()) as ApiErrorPayload;
  } catch {
    // Infrastructure errors may return an empty or non-JSON response.
  }
  const firstMessage = Object.values(fields).flat().find(Boolean);
  return new ApiError(
    fields.detail ?? firstMessage ?? `Request failed (${response.status})`,
    response.status,
    fields,
  );
}

let refreshRequest: Promise<string> | null = null;

async function refreshAccessToken() {
  const refresh = storage()?.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw new ApiError("Your session has expired. Please sign in again.", 401);

  const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    clearSession();
    throw await parseError(response);
  }

  const tokens = (await response.json()) as Pick<AuthTokens, "access">;
  storage()?.setItem(ACCESS_TOKEN_KEY, tokens.access);
  return tokens.access;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  const access = storage()?.getItem(ACCESS_TOKEN_KEY);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && hasSession()) {
    refreshRequest ??= refreshAccessToken().finally(() => {
      refreshRequest = null;
    });
    await refreshRequest;
    return apiRequest<T>(path, init, false);
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type UserRole = "student" | "teacher";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile extends AuthUser {
  grade_level?: string;
  weakness_summary?: string | null;
  bio?: string;
  teaching_style_summary?: string | null;
  ai_instructions?: string | null;
  updated_at?: string;
}

export type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | "email"
    | "first_name"
    | "last_name"
    | "gender"
    | "phone"
    | "grade_level"
    | "bio"
    | "teaching_style_summary"
    | "ai_instructions"
  >
>;

interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export type CourseStatus = "draft" | "active" | "archived";

export interface Course {
  id: number;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  status: CourseStatus;
  teacher_name: string;
  student_count: number;
  resource_count: number;
  created_at: string;
}

export interface LearnerCourse extends Course {
  is_enrolled: boolean;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  status: CourseStatus;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CourseResource {
  id: number;
  file_name: string;
  file: string;
  file_size: number;
  is_style_example: boolean;
  processing_status: "uploaded" | "processing" | "completed" | "failed";
  created_at: string;
}

export interface UpdateCourseResourceInput {
  file_name?: string;
  is_style_example?: boolean;
}

export interface CourseStudent {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  enrolled_at: string;
}

export interface CourseProgressStats {
  course: {
    id: number;
    title: string;
    status: CourseStatus;
  };
  quiz_progress: {
    quiz_count: number;
    attempt_count: number;
    best_score: number | null;
    average_score: number | null;
    answered_question_count: number;
    correct_answer_count: number;
    latest_attempt_at: string | null;
  };
  learning_activity: {
    flashcard_set_count: number;
    flashcard_card_count: number;
    chat_session_count: number;
    chat_message_count: number;
    completed_resource_count: number;
    latest_chat_at: string | null;
  };
}

export interface CourseStudentProgress {
  student: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  course: {
    id: number;
    title: string;
    status: CourseStatus;
  };
  enrollment: {
    classroom_id: number;
    classroom_name: string;
    enrolled_at: string;
  };
  quiz_progress: {
    quiz_count: number;
    attempt_count: number;
    best_score: number | null;
    average_score: number | null;
    answered_question_count: number;
    correct_answer_count: number;
    latest_attempt_at: string | null;
  };
  learning_activity: {
    flashcard_set_count: number;
    flashcard_card_count: number;
    chat_session_count: number;
    chat_message_count: number;
    completed_resource_count: number;
    latest_chat_at: string | null;
  };
  teacher_course_progress: {
    summary: {
      course_count: number;
      attempt_count: number;
      student_chat_message_count: number;
      flashcard_card_count: number;
      weighted_average_score: number | null;
    };
    courses: CourseProgressStats[];
  };
}

export interface WeakTopic {
  question_id: number;
  quiz_id: number;
  quiz_title: string;
  topic: string;
  miss_count: number;
  selected_options: string[];
  selected_choices: { key: string; text: string }[];
  correct_option: string;
  correct_choice: string;
  explanation: string;
}

export interface WeaknessReport {
  id: number;
  student_id: number;
  student_username: string;
  student_name: string;
  course_id: number;
  course_title: string;
  weakness_summary: string;
  weak_topics: WeakTopic[];
  generated_at: string;
}

export interface TutorAnalyticsOverview {
  summary: {
    course_count: number;
    active_course_count: number;
    student_count: number;
    resource_count: number;
    quiz_count: number;
    quiz_attempt_count: number;
    average_score: number | null;
    best_score: number | null;
    weak_topic_count: number;
    chat_session_count: number;
    student_chat_message_count: number;
    flashcard_set_count: number;
  };
  course_activity: Array<{
    id: number;
    title: string;
    status: CourseStatus;
    student_count: number;
    quiz_count: number;
    attempt_count: number;
    average_score: number | null;
    weak_topic_count: number;
  }>;
  recent_attempts: Array<{
    id: number;
    student_name: string;
    course_title: string;
    quiz_title: string;
    score: number;
    attempted_at: string;
  }>;
  recent_reports: Array<{
    id: number;
    student_name: string;
    course_title: string;
    weak_topic_count: number;
    generated_at: string;
  }>;
}

export interface LearnerAnalyticsOverview {
  summary: {
    enrolled_course_count: number;
    quiz_attempt_count: number;
    average_score: number | null;
    best_score: number | null;
    flashcard_set_count: number;
    flashcard_card_count: number;
    chat_session_count: number;
    student_chat_message_count: number;
  };
  course_progress: Array<{
    id: number;
    title: string;
    teacher_name: string;
    quiz_count: number;
    attempt_count: number;
    best_score: number | null;
    average_score: number | null;
    flashcard_set_count: number;
    chat_session_count: number;
  }>;
  recent_attempts: Array<{
    id: number;
    course_title: string;
    quiz_title: string;
    score: number;
    attempted_at: string;
  }>;
}

export interface CourseChatSource {
  resource_id: number;
  file_name: string;
  page_number: number | null;
  chunk_index: number;
  preview: string;
}

export interface CourseChatResponse {
  session_id: number;
  message: string;
  answer: string;
  sources: CourseChatSource[];
}

export async function login(username: string, password: string) {
  const tokens = await apiRequest<AuthTokens>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  saveSession(tokens);
  return apiRequest<AuthUser>("/api/auth/me/");
}

export function register(input: RegisterInput) {
  return apiRequest<AuthUser>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser() {
  return apiRequest<AuthUser>("/api/auth/me/");
}

export function getProfile() {
  return apiRequest<UserProfile>("/api/auth/profile/");
}

export function updateProfile(input: UpdateProfileInput) {
  return apiRequest<UserProfile>("/api/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getTutorAnalyticsOverview() {
  return apiRequest<TutorAnalyticsOverview>("/api/analytics/tutor/overview/");
}

export function getLearnerAnalyticsOverview() {
  return apiRequest<LearnerAnalyticsOverview>("/api/analytics/learner/overview/");
}

export function listCourses() {
  return apiRequest<Course[]>("/api/courses/");
}

export function createCourse(input: CreateCourseInput) {
  return apiRequest<Course>("/api/courses/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCourse(courseId: number) {
  return apiRequest<Course>(`/api/courses/${courseId}/`);
}

export function updateCourse(courseId: number, input: UpdateCourseInput) {
  return apiRequest<Course>(`/api/courses/${courseId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listAvailableCourses() {
  return apiRequest<LearnerCourse[]>("/api/courses/available/");
}

export function listEnrolledCourses() {
  return apiRequest<LearnerCourse[]>("/api/courses/enrolled/");
}

export function enrollInCourse(courseId: number) {
  return apiRequest<LearnerCourse>(`/api/courses/${courseId}/enroll/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function listCourseResources(courseId: number) {
  return apiRequest<CourseResource[]>(`/api/courses/${courseId}/resources/`);
}

export function listLearnerCourseResources(courseId: number) {
  return apiRequest<CourseResource[]>(`/api/courses/${courseId}/learner-resources/`);
}

export function updateCourseResource(
  courseId: number,
  resourceId: number,
  input: UpdateCourseResourceInput,
) {
  return apiRequest<CourseResource>(`/api/courses/${courseId}/resources/${resourceId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCourseResource(courseId: number, resourceId: number) {
  return apiRequest<void>(`/api/courses/${courseId}/resources/${resourceId}/`, {
    method: "DELETE",
  });
}

export function uploadCourseResource(courseId: number, file: File) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<CourseResource>(`/api/courses/${courseId}/resources/`, {
    method: "POST",
    body,
  });
}

export function listCourseStudents(courseId: number) {
  return apiRequest<CourseStudent[]>(`/api/courses/${courseId}/students/`);
}

export function getCourseStudentProgress(courseId: number, studentId: number) {
  return apiRequest<CourseStudentProgress>(
    `/api/courses/${courseId}/students/${studentId}/progress/`,
  );
}

export function listCourseWeaknessReports(courseId: number) {
  return apiRequest<WeaknessReport[]>(`/api/analytics/courses/${courseId}/weakness-reports/`);
}

export function getWeaknessReport(reportId: number) {
  return apiRequest<WeaknessReport>(`/api/analytics/weakness-reports/${reportId}/`);
}

export function generateCourseWeaknessReports(courseId: number, studentId?: number) {
  return apiRequest<WeaknessReport[]>(
    `/api/analytics/courses/${courseId}/weakness-reports/generate/`,
    {
      method: "POST",
      body: JSON.stringify(studentId ? { student_id: studentId } : {}),
    },
  );
}

export function resolveFileUrl(fileUrl: string) {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

export interface ChatMessageHistory {
  id: number;
  sender: "student" | "ai";
  message_text: string;
  source_references: CourseChatSource[];
  created_at: string;
}

export interface ChatSessionSummary {
  id: number;
  course_id: number;
  created_at: string;
  last_message: {
    sender: "student" | "ai";
    message_text: string;
    created_at: string;
  } | null;
}

export interface ChatSessionDetail {
  id: number;
  course_id: number;
  created_at: string;
  messages: ChatMessageHistory[];
}

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizOption {
  key: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
}

export interface QuizQuestionResult extends QuizQuestion {
  correct_option: string;
  explanation: string;
}

export interface QuizSummary {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  difficulty_level: QuizDifficulty;
  question_count: number;
  attempt_count: number;
  best_score: number | null;
  latest_attempt_id: number | null;
  latest_attempt_at: string | null;
  created_at: string;
}

export interface QuizDetail {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  difficulty_level: QuizDifficulty;
  questions: QuizQuestion[];
  created_at: string;
}

export interface GenerateQuizInput {
  question_count?: number;
  difficulty_level?: QuizDifficulty;
}

export interface QuizAnswerSubmission {
  question_id: number;
  selected_option: string;
}

export interface QuizAttemptAnswer {
  question: QuizQuestionResult;
  selected_option: string;
  is_correct: boolean;
}

export interface QuizAttemptResult {
  id: number;
  quiz_id: number;
  quiz_title: string;
  course_id: number;
  course_title: string;
  student_id: number;
  student_name: string;
  score: number;
  attempted_at: string;
  answers: QuizAttemptAnswer[];
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface FlashcardSetSummary {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  card_count: number;
  created_at: string;
}

export interface FlashcardSetDetail {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  cards: Flashcard[];
  created_at: string;
}

export function chatWithCourse(courseId: number, message: string, sessionId?: number) {
  return apiRequest<CourseChatResponse>(`/api/ai/courses/${courseId}/chat/`, {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  });
}

export function listCourseChatSessions(courseId: number) {
  return apiRequest<ChatSessionSummary[]>(`/api/ai/courses/${courseId}/chat/sessions/`);
}

export function getChatSession(sessionId: number) {
  return apiRequest<ChatSessionDetail>(`/api/ai/chat/sessions/${sessionId}/`);
}

export function listQuizzes() {
  return apiRequest<QuizSummary[]>("/api/quizzes/");
}

export function generateCourseQuiz(courseId: number, input: GenerateQuizInput = {}) {
  return apiRequest<QuizDetail>(`/api/quizzes/courses/${courseId}/generate/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getQuiz(quizId: number) {
  return apiRequest<QuizDetail>(`/api/quizzes/${quizId}/`);
}

export function submitQuizAttempt(quizId: number, answers: QuizAnswerSubmission[]) {
  return apiRequest<QuizAttemptResult>(`/api/quizzes/${quizId}/submit/`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getQuizAttempt(attemptId: number) {
  return apiRequest<QuizAttemptResult>(`/api/quizzes/attempts/${attemptId}/`);
}

export function listFlashcardSets() {
  return apiRequest<FlashcardSetSummary[]>("/api/flashcards/");
}

export function generateCourseFlashcards(courseId: number, cardCount = 10) {
  return apiRequest<FlashcardSetDetail>(`/api/flashcards/courses/${courseId}/generate/`, {
    method: "POST",
    body: JSON.stringify({ card_count: cardCount }),
  });
}

export function getFlashcardSet(setId: number) {
  return apiRequest<FlashcardSetDetail>(`/api/flashcards/${setId}/`);
}

export function getRoleHome(role: UserRole) {
  return role === "teacher" ? "/tutor/courses" : "/learner/courses";
}
