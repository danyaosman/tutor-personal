from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Max, Min
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import generics, parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.models import TeachingStyleExample
from analytics.serializers import TeachingStyleExampleSerializer
from ai_tutor.services.chunk_service import process_course_resource
from accounts.permissions import IsStudent, IsTeacher
from ai_tutor.models import ChatMessage, ChatSession, ResourceChunk
from flashcards.models import Flashcard, FlashcardSet
from quizzes.models import Quiz, QuizAnswer, QuizAttempt

from .models import Classroom, ClassroomEnrollment, Course, CourseResource, Syllabus
from .serializers import (
    CourseResourceSerializer,
    CourseSerializer,
    CourseStudentSerializer,
    LearnerCourseSerializer,
    SyllabusGenerateSerializer,
    SyllabusSerializer,
)

User = get_user_model()


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
            is_style_example=False,
        ).order_by("-created_at")


def build_syllabus_content(course, notes=""):
    resources = list(
        CourseResource.objects.filter(course=course)
        .order_by("-is_style_example", "file_name")
        .values_list("file_name", "is_style_example")
    )
    resource_lines = [
        f"- {file_name}{' (teaching style reference)' if is_style_example else ''}"
        for file_name, is_style_example in resources
    ]
    sample_chunks = list(
        ResourceChunk.objects.filter(resource__course=course)
        .select_related("resource")
        .order_by("resource__file_name", "chunk_index")[:5]
    )
    topic_lines = [
        f"- {chunk.content[:180].strip()}"
        for chunk in sample_chunks
        if chunk.content.strip()
    ]
    if not resource_lines:
        resource_lines = ["- No course PDFs uploaded yet."]
    if not topic_lines:
        topic_lines = [
            f"- Core ideas from {course.subject}",
            f"- Practice activities for {course.grade_level}",
            "- Review, quiz practice, and learner questions",
        ]
    notes_section = f"\nTutor notes:\n{notes.strip()}\n" if notes.strip() else ""

    return "\n".join(
        [
            f"{course.title} Syllabus",
            "",
            f"Subject: {course.subject}",
            f"Grade level: {course.grade_level}",
            "",
            "Course description:",
            course.description,
            notes_section.strip(),
            "",
            "Learning goals:",
            f"- Build confidence with the main ideas in {course.subject}.",
            "- Use course resources to answer questions with evidence.",
            "- Practice through quizzes, flashcards, and AI tutor sessions.",
            "",
            "Source resources:",
            *resource_lines,
            "",
            "Suggested weekly outline:",
            "1. Orientation and baseline review",
            "2. Guided study of uploaded course resources",
            "3. Practice questions and misconception checks",
            "4. Flashcard review and spaced recall",
            "5. Quiz attempt, feedback, and targeted revision",
            "",
            "Topics to emphasize:",
            *topic_lines,
            "",
            "Assessment plan:",
            "- Use generated quizzes to check understanding.",
            "- Review weakness reports for missed concepts.",
            "- Revisit course PDFs and flashcards before the demo assessment.",
        ]
    ).replace("\n\n\n", "\n\n")


class CourseSyllabusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_course(self):
        return get_object_or_404(
            Course,
            pk=self.kwargs["course_pk"],
            teacher=self.request.user,
        )

    def get_syllabus(self):
        syllabus, _ = Syllabus.objects.get_or_create(
            course=self.get_course(),
            defaults={"generated_content": ""},
        )
        return syllabus

    def get(self, request, course_pk):
        serializer = SyllabusSerializer(self.get_syllabus())
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, course_pk):
        syllabus = self.get_syllabus()
        serializer = SyllabusSerializer(
            syllabus,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, course_pk):
        return self.patch(request, course_pk)


class GenerateCourseSyllabusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, teacher=request.user)
        request_serializer = SyllabusGenerateSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        generated_content = build_syllabus_content(
            course,
            request_serializer.validated_data.get("notes", ""),
        )
        syllabus, _ = Syllabus.objects.update_or_create(
            course=course,
            defaults={
                "generated_content": generated_content,
                "edited_content": generated_content,
            },
        )
        serializer = SyllabusSerializer(syllabus)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeachingStyleExampleListCreateView(generics.ListCreateAPIView):
    serializer_class = TeachingStyleExampleSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_course(self):
        return get_object_or_404(
            Course,
            pk=self.kwargs["course_pk"],
            teacher=self.request.user,
        )

    def get_queryset(self):
        return TeachingStyleExample.objects.filter(
            teacher=self.request.user,
            course=self.get_course(),
        ).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(
            teacher=self.request.user,
            course=self.get_course(),
            source_file_url=serializer.validated_data.get("source_file_url", ""),
        )


class TeachingStyleExampleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeachingStyleExampleSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return TeachingStyleExample.objects.filter(
            teacher=self.request.user,
            course_id=self.kwargs["course_pk"],
            course__teacher=self.request.user,
        )


class CourseStudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, teacher=request.user)
        students = (
            User.objects.filter(
                role=User.STUDENT,
                classroom_enrollments__classroom__course=course,
            )
            .annotate(enrolled_at=Min("classroom_enrollments__enrolled_at"))
            .order_by("username")
            .distinct()
        )
        serializer = CourseStudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseStudentProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def build_course_progress(self, student, course):
        attempts = QuizAttempt.objects.filter(
            student=student,
            quiz__course=course,
        )
        quiz_stats = attempts.aggregate(
            attempt_count=Count("id"),
            best_score=Max("score"),
            average_score=Avg("score"),
        )
        quiz_count = Quiz.objects.filter(course=course).count()
        answered_question_count = QuizAnswer.objects.filter(attempt__in=attempts).count()
        correct_answer_count = QuizAnswer.objects.filter(
            attempt__in=attempts,
            is_correct=True,
        ).count()
        flashcard_sets = FlashcardSet.objects.filter(student=student, course=course)
        chat_sessions = ChatSession.objects.filter(student=student, course=course)
        latest_attempt = attempts.order_by("-attempted_at").first()
        latest_chat_session = chat_sessions.order_by("-created_at").first()

        return {
            "course": {
                "id": course.id,
                "title": course.title,
                "status": course.status,
            },
            "quiz_progress": {
                "quiz_count": quiz_count,
                "attempt_count": quiz_stats["attempt_count"],
                "best_score": quiz_stats["best_score"],
                "average_score": round(quiz_stats["average_score"], 2)
                if quiz_stats["average_score"] is not None
                else None,
                "answered_question_count": answered_question_count,
                "correct_answer_count": correct_answer_count,
                "latest_attempt_at": latest_attempt.attempted_at if latest_attempt else None,
            },
            "learning_activity": {
                "flashcard_set_count": flashcard_sets.count(),
                "flashcard_card_count": Flashcard.objects.filter(set__in=flashcard_sets).count(),
                "chat_session_count": chat_sessions.count(),
                "chat_message_count": ChatMessage.objects.filter(
                    session__in=chat_sessions,
                    sender="student",
                ).count(),
                "completed_resource_count": CourseResource.objects.filter(
                    course=course,
                    processing_status="completed",
                ).count(),
                "latest_chat_at": latest_chat_session.created_at if latest_chat_session else None,
            },
        }

    def build_teacher_course_progress(self, teacher, student):
        courses = (
            Course.objects.filter(
                teacher=teacher,
                classrooms__enrollments__student=student,
            )
            .order_by("title")
            .distinct()
        )
        course_rows = []
        total_attempts = 0
        total_student_messages = 0
        total_flashcards = 0
        weighted_score_sum = 0

        for course in courses:
            row = self.build_course_progress(student, course)
            attempt_count = row["quiz_progress"]["attempt_count"]
            average_score = row["quiz_progress"]["average_score"]
            if average_score is not None and attempt_count:
                weighted_score_sum += average_score * attempt_count
            total_attempts += attempt_count
            total_student_messages += row["learning_activity"]["chat_message_count"]
            total_flashcards += row["learning_activity"]["flashcard_card_count"]
            course_rows.append(row)

        weighted_average_score = (
            round(weighted_score_sum / total_attempts, 2) if total_attempts else None
        )

        return {
            "summary": {
                "course_count": len(course_rows),
                "attempt_count": total_attempts,
                "student_chat_message_count": total_student_messages,
                "flashcard_card_count": total_flashcards,
                "weighted_average_score": weighted_average_score,
            },
            "courses": course_rows,
        }

    def get(self, request, course_pk, student_pk):
        course = get_object_or_404(Course, pk=course_pk, teacher=request.user)
        student = get_object_or_404(User, pk=student_pk, role=User.STUDENT)
        enrollment = (
            ClassroomEnrollment.objects.select_related("classroom")
            .filter(student=student, classroom__course=course)
            .order_by("enrolled_at")
            .first()
        )
        if enrollment is None:
            raise Http404("Student is not enrolled in this course.")

        current_course_progress = self.build_course_progress(student, course)

        data = {
            "student": {
                "id": student.id,
                "username": student.username,
                "email": student.email,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "full_name": student.get_full_name() or student.username,
            },
            "course": {
                "id": course.id,
                "title": course.title,
                "status": course.status,
            },
            "enrollment": {
                "classroom_id": enrollment.classroom_id,
                "classroom_name": enrollment.classroom.name,
                "enrolled_at": enrollment.enrolled_at,
            },
            "quiz_progress": current_course_progress["quiz_progress"],
            "learning_activity": current_course_progress["learning_activity"],
            "teacher_course_progress": self.build_teacher_course_progress(
                request.user,
                student,
            ),
        }
        return Response(data, status=status.HTTP_200_OK)
