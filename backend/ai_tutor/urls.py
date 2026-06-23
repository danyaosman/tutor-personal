from django.urls import path

from .views import CourseChatView

urlpatterns = [
    path("courses/<int:course_pk>/chat/", CourseChatView.as_view(), name="course-chat"),
]
