from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_tutor.services.chunk_service import process_course_resource
from accounts.permissions import IsStudent, IsTeacher

from .models import Classroom, ClassroomEnrollment, Course, CourseResource
from .serializers import CourseResourceSerializer, CourseSerializer, LearnerCourseSerializer


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


class AvailableCourseListView(generics.ListAPIView):
    serializer_class = LearnerCourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        return (
            Course.objects.filter(status="active")
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


class EnrolledCourseListView(generics.ListAPIView):
    serializer_class = LearnerCourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        return (
            Course.objects.filter(
                status="active",
                classrooms__enrollments__student=self.request.user,
            )
            .select_related("teacher")
            .annotate(
                student_count=Count(
                    "classrooms__enrollments__student",
                    distinct=True,
                ),
                resource_count=Count("resources", distinct=True),
            )
            .distinct()
            .order_by("-created_at")
        )


class CourseEnrollmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, status="active")
        classroom, _ = Classroom.objects.get_or_create(
            course=course,
            name="Default Class",
            defaults={"description": "Auto-created learner enrollment classroom."},
        )
        ClassroomEnrollment.objects.get_or_create(
            student=request.user,
            classroom=classroom,
        )
        queryset = (
            Course.objects.filter(pk=course.pk)
            .select_related("teacher")
            .annotate(
                student_count=Count(
                    "classrooms__enrollments__student",
                    distinct=True,
                ),
                resource_count=Count("resources", distinct=True),
            )
        )
        serializer = LearnerCourseSerializer(
            queryset.get(),
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
        resource = serializer.save(
            course=self.get_course(),
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
        )
        process_course_resource(resource)


class CourseResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return CourseResource.objects.filter(
            course_id=self.kwargs["course_pk"],
            course__teacher=self.request.user,
        )

    def perform_destroy(self, instance):
        uploaded_file = instance.file
        instance.delete()
        if uploaded_file:
            uploaded_file.delete(save=False)


class LearnerCourseResourceListView(generics.ListAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        course = get_object_or_404(
            Course,
            pk=self.kwargs["course_pk"],
            status="active",
            classrooms__enrollments__student=self.request.user,
        )
        return CourseResource.objects.filter(
            course=course,
            processing_status="completed",
        ).order_by("-created_at")
