from django.urls import path

from .views import (
    CourseChatView,
    StudentChatSessionDetailView,
    StudentCourseChatSessionListView,
)
urlpatterns = [
    path("courses/<int:course_pk>/chat/", CourseChatView.as_view(), name="course-chat"),
    path(
        "courses/<int:course_pk>/chat/sessions/",
        StudentCourseChatSessionListView.as_view(),
        name="student-course-chat-sessions",
    ),
    path(
        "chat/sessions/<int:session_pk>/",
        StudentChatSessionDetailView.as_view(),
        name="student-chat-session-detail",
    ),
]