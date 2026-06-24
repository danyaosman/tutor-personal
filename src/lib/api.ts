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

export function getRoleHome(role: UserRole) {
  return role === "teacher" ? "/tutor/overview" : "/learner";
}
