from django.contrib.auth import get_user_model
from django.http import Http404
from django.db.models import Avg, Max
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent, IsTeacher
from ai_tutor.models import ChatMessage, ChatSession
from courses.models import ClassroomEnrollment, Course, CourseResource
from flashcards.models import Flashcard, FlashcardSet
from quizzes.models import Quiz, QuizAnswer, QuizAttempt

from .models import WeaknessReport
from .serializers import WeaknessReportGenerateSerializer, WeaknessReportSerializer
from .services import enrolled_students_for_course, generate_weakness_report

User = get_user_model()


def round_or_none(value):
    return round(value, 2) if value is not None else None


class TutorAnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request):
        courses = Course.objects.filter(teacher=request.user)
        attempts = QuizAttempt.objects.filter(quiz__course__teacher=request.user)
        score_stats = attempts.aggregate(
            average_score=Avg("score"),
            best_score=Max("score"),
        )
        reports = WeaknessReport.objects.filter(course__teacher=request.user)
        weak_topic_count = sum(len(report.weak_topics or []) for report in reports)
        recent_attempts = (
            attempts.select_related("student", "quiz", "quiz__course")
            .order_by("-attempted_at")[:3]
        )
        recent_reports = reports.select_related("student", "course").order_by("-generated_at")[:3]

        return Response(
            {
                "summary": {
                    "course_count": courses.count(),
                    "active_course_count": courses.filter(status="active").count(),
                    "student_count": User.objects.filter(
                        role=User.STUDENT,
                        classroom_enrollments__classroom__course__teacher=request.user,
                    )
                    .distinct()
                    .count(),
                    "resource_count": CourseResource.objects.filter(course__teacher=request.user).count(),
                    "quiz_count": Quiz.objects.filter(course__teacher=request.user).count(),
                    "quiz_attempt_count": attempts.count(),
                    "average_score": round_or_none(score_stats["average_score"]),
                    "best_score": score_stats["best_score"],
                    "weak_topic_count": weak_topic_count,
                    "chat_session_count": ChatSession.objects.filter(
                        course__teacher=request.user
                    ).count(),
                    "student_chat_message_count": ChatMessage.objects.filter(
                        session__course__teacher=request.user,
                        sender="student",
                    ).count(),
                    "flashcard_set_count": FlashcardSet.objects.filter(
                        course__teacher=request.user
                    ).count(),
                },
                "course_activity": [
                    {
                        "id": course.id,
                        "title": course.title,
                        "status": course.status,
                        "student_count": User.objects.filter(
                            role=User.STUDENT,
                            classroom_enrollments__classroom__course=course,
                        )
                        .distinct()
                        .count(),
                        "quiz_count": Quiz.objects.filter(course=course).count(),
                        "attempt_count": QuizAttempt.objects.filter(quiz__course=course).count(),
                        "average_score": round_or_none(
                            QuizAttempt.objects.filter(quiz__course=course).aggregate(
                                average_score=Avg("score")
                            )["average_score"]
                        ),
                        "weak_topic_count": sum(
                            len(report.weak_topics or [])
                            for report in WeaknessReport.objects.filter(course=course)
                        ),
                    }
                    for course in courses.order_by("title")
                ],
                "recent_attempts": [
                    {
                        "id": attempt.id,
                        "student_name": attempt.student.get_full_name() or attempt.student.username,
                        "course_title": attempt.quiz.course.title,
                        "quiz_title": attempt.quiz.title,
                        "score": attempt.score,
                        "attempted_at": attempt.attempted_at,
                    }
                    for attempt in recent_attempts
                ],
                "recent_reports": [
                    {
                        "id": report.id,
                        "student_name": report.student.get_full_name() or report.student.username,
                        "course_title": report.course.title,
                        "weak_topic_count": len(report.weak_topics or []),
                        "generated_at": report.generated_at,
                    }
                    for report in recent_reports
                ],
            },
            status=status.HTTP_200_OK,
        )


class LearnerAnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        enrolled_courses = Course.objects.filter(
            status="active",
            classrooms__enrollments__student=request.user,
        ).distinct()
        attempts = QuizAttempt.objects.filter(student=request.user)
        score_stats = attempts.aggregate(
            average_score=Avg("score"),
            best_score=Max("score"),
        )
        flashcard_sets = FlashcardSet.objects.filter(
            student=request.user,
            course__in=enrolled_courses,
        )
        chat_sessions = ChatSession.objects.filter(
            student=request.user,
            course__in=enrolled_courses,
        )
        recent_attempts = (
            attempts.select_related("quiz", "quiz__course")
            .filter(quiz__course__in=enrolled_courses)
            .order_by("-attempted_at")[:3]
        )
        course_progress = []
        for course in enrolled_courses.order_by("title"):
            course_attempts = attempts.filter(quiz__course=course)
            course_stats = course_attempts.aggregate(
                average_score=Avg("score"),
                best_score=Max("score"),
            )
            course_progress.append(
                {
                    "id": course.id,
                    "title": course.title,
                    "teacher_name": course.teacher.get_full_name() or course.teacher.username,
                    "quiz_count": Quiz.objects.filter(course=course).count(),
                    "attempt_count": course_attempts.count(),
                    "best_score": course_stats["best_score"],
                    "average_score": round_or_none(course_stats["average_score"]),
                    "flashcard_set_count": FlashcardSet.objects.filter(
                        student=request.user,
                        course=course,
                    ).count(),
                    "chat_session_count": ChatSession.objects.filter(
                        student=request.user,
                        course=course,
                    ).count(),
                }
            )

        return Response(
            {
                "summary": {
                    "enrolled_course_count": enrolled_courses.count(),
                    "quiz_attempt_count": attempts.filter(quiz__course__in=enrolled_courses).count(),
                    "average_score": round_or_none(score_stats["average_score"]),
                    "best_score": score_stats["best_score"],
                    "flashcard_set_count": flashcard_sets.count(),
                    "flashcard_card_count": Flashcard.objects.filter(set__in=flashcard_sets).count(),
                    "chat_session_count": chat_sessions.count(),
                    "student_chat_message_count": ChatMessage.objects.filter(
                        session__in=chat_sessions,
                        sender="student",
                    ).count(),
                },
                "course_progress": course_progress,
                "recent_attempts": [
                    {
                        "id": attempt.id,
                        "course_title": attempt.quiz.course.title,
                        "quiz_title": attempt.quiz.title,
                        "score": attempt.score,
                        "attempted_at": attempt.attempted_at,
                    }
                    for attempt in recent_attempts
                ],
            },
            status=status.HTTP_200_OK,
        )


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


class WeaknessReportDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request, report_pk):
        report = get_object_or_404(
            WeaknessReport.objects.select_related("student", "course").filter(
                course__teacher=request.user,
            ),
            pk=report_pk,
        )
        serializer = WeaknessReportSerializer(report)
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
