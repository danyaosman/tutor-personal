from django.urls import path

from .views import (
    AvailableCourseListView,
    CourseDetailView,
    CourseEnrollmentView,
    CourseResourceDetailView,
    CourseSyllabusView,
    CourseStudentListView,
    CourseStudentProgressView,
    EnrolledCourseListView,
    GenerateCourseSyllabusView,
    LearnerCourseResourceListView,
    TeachingStyleExampleDetailView,
    TeachingStyleExampleListCreateView,
    CourseListCreateView,
    CourseResourceListCreateView,
)

urlpatterns = [
    path("", CourseListCreateView.as_view(), name="course-list-create"),
    path("available/", AvailableCourseListView.as_view(), name="available-course-list"),
    path("enrolled/", EnrolledCourseListView.as_view(), name="enrolled-course-list"),
    path("<int:course_pk>/enroll/", CourseEnrollmentView.as_view(), name="course-enroll"),
    path(
        "<int:course_pk>/students/",
        CourseStudentListView.as_view(),
        name="course-student-list",
    ),
    path(
        "<int:course_pk>/students/<int:student_pk>/progress/",
        CourseStudentProgressView.as_view(),
        name="course-student-progress",
    ),
    path(
        "<int:course_pk>/syllabus/",
        CourseSyllabusView.as_view(),
        name="course-syllabus",
    ),
    path(
        "<int:course_pk>/syllabus/generate/",
        GenerateCourseSyllabusView.as_view(),
        name="course-syllabus-generate",
    ),
    path(
        "<int:course_pk>/teaching-style-examples/",
        TeachingStyleExampleListCreateView.as_view(),
        name="course-teaching-style-example-list-create",
    ),
    path(
        "<int:course_pk>/teaching-style-examples/<int:pk>/",
        TeachingStyleExampleDetailView.as_view(),
        name="course-teaching-style-example-detail",
    ),
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
