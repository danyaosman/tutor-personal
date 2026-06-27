from django.urls import path

from .views import CourseWeaknessReportListView, GenerateCourseWeaknessReportView

urlpatterns = [
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
