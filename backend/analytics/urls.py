from django.urls import path

from .views import (
    CourseWeaknessReportListView,
    GenerateCourseWeaknessReportView,
    LearnerAnalyticsOverviewView,
    TutorAnalyticsOverviewView,
    WeaknessReportDetailView,
)

urlpatterns = [
    path("tutor/overview/", TutorAnalyticsOverviewView.as_view(), name="tutor-analytics-overview"),
    path(
        "weakness-reports/<int:report_pk>/",
        WeaknessReportDetailView.as_view(),
        name="weakness-report-detail",
    ),
    path(
        "learner/overview/",
        LearnerAnalyticsOverviewView.as_view(),
        name="learner-analytics-overview",
    ),
    path(
        "courses/<int:course_pk>/weakness-reports/",
        CourseWeaknessReportListView.as_view(),
        name="course-weakness-report-list",
    ),
    path(
        "courses/<int:course_pk>/weakness-reports/generate/",
        GenerateCourseWeaknessReportView.as_view(),
        name="course-weakness-report-generate",
    ),
]
