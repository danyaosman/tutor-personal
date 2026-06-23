from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, parsers, permissions

from accounts.permissions import IsTeacher

from .models import Course, CourseResource
from .serializers import CourseResourceSerializer, CourseSerializer


class TutorCourseQuerysetMixin:
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return (
            Course.objects.filter(teacher=self.request.user)
            .select_related("teacher")
            .annotate(
                student_count=Count(
                    "classrooms__enrollments__student",
                    distinct=True,
                ),
                resource_count=Count("resources", distinct=True),
            )
            .order_by("-created_at")
        )


class CourseListCreateView(TutorCourseQuerysetMixin, generics.ListCreateAPIView):
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class CourseDetailView(TutorCourseQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    pass


class CourseResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_course(self):
        return get_object_or_404(
            Course,
            pk=self.kwargs["course_pk"],
            teacher=self.request.user,
        )

    def get_queryset(self):
        return CourseResource.objects.filter(course=self.get_course()).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        uploaded_file = serializer.validated_data["file"]
        serializer.save(
            course=self.get_course(),
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
        )
