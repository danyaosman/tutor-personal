from django.urls import path

from .views import (
    AvailableCourseListView,
    CourseDetailView,
    CourseEnrollmentView,
    CourseResourceDetailView,
    EnrolledCourseListView,
    LearnerCourseResourceListView,
    CourseListCreateView,
    CourseResourceListCreateView,
)

urlpatterns = [
    path("", CourseListCreateView.as_view(), name="course-list-create"),
    path("available/", AvailableCourseListView.as_view(), name="available-course-list"),
    path("enrolled/", EnrolledCourseListView.as_view(), name="enrolled-course-list"),
    path("<int:course_pk>/enroll/", CourseEnrollmentView.as_view(), name="course-enroll"),
    path(
        "<int:course_pk>/learner-resources/",
        LearnerCourseResourceListView.as_view(),
        name="learner-course-resource-list",
    ),
    path("<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path(
        "<int:course_pk>/resources/",
        CourseResourceListCreateView.as_view(),
        name="course-resource-list-create",
    ),
    path(
        "<int:course_pk>/resources/<int:pk>/",
        CourseResourceDetailView.as_view(),
        name="course-resource-detail",
    ),
]
