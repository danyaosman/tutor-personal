from django.urls import path

from .views import (
    CourseDetailView,
    CourseListCreateView,
    CourseResourceListCreateView,
)

urlpatterns = [
    path("", CourseListCreateView.as_view(), name="course-list-create"),
    path("<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path(
        "<int:course_pk>/resources/",
        CourseResourceListCreateView.as_view(),
        name="course-resource-list-create",
    ),
]
