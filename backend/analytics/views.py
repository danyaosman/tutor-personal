from django.contrib.auth import get_user_model
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsTeacher
from courses.models import ClassroomEnrollment, Course

from .models import WeaknessReport
from .serializers import WeaknessReportGenerateSerializer, WeaknessReportSerializer
from .services import enrolled_students_for_course, generate_weakness_report

User = get_user_model()


class CourseWeaknessReportListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, teacher=request.user)
        reports = (
            WeaknessReport.objects.filter(course=course)
            .select_related("student", "course")
            .order_by("student__username")
        )
        serializer = WeaknessReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GenerateCourseWeaknessReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, teacher=request.user)
        request_serializer = WeaknessReportGenerateSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        student_id = request_serializer.validated_data.get("student_id")
        if student_id is not None:
            student = get_object_or_404(User, pk=student_id, role=User.STUDENT)
            if not ClassroomEnrollment.objects.filter(
                student=student,
                classroom__course=course,
            ).exists():
                raise Http404("Student is not enrolled in this course.")
            students = [student]
        else:
            students = list(enrolled_students_for_course(course))

        reports = [generate_weakness_report(student, course) for student in students]
        serializer = WeaknessReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
