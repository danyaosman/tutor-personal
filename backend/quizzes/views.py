from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent
from courses.models import ClassroomEnrollment, Course
from .models import Quiz, QuizAnswer, QuizAttempt
from .serializers import (
    QuizAttemptResultSerializer,
    QuizDetailSerializer,
    QuizGenerateSerializer,
    QuizListSerializer,
    QuizSubmitSerializer,
)
from .services import generate_quiz_for_course


def get_enrolled_course(user, course_pk):
    course = get_object_or_404(Course, pk=course_pk, status="active")
    if not ClassroomEnrollment.objects.filter(
        student=user,
        classroom__course=course,
    ).exists():
        return None
    return course


def learner_quiz_queryset(user):
    return (
        Quiz.objects.filter(
            course__status="active",
            course__classrooms__enrollments__student=user,
        )
        .select_related("course")
        .prefetch_related("questions")
        .annotate(question_count=Count("questions", distinct=True))
        .distinct()
        .order_by("-created_at")
    )


class LearnerQuizListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        serializer = QuizListSerializer(
            learner_quiz_queryset(request.user),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class GenerateQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, course_pk):
        course = get_enrolled_course(request.user, course_pk)
        if not course:
            return Response(
                {"detail": "Enroll in this course before generating a quiz."},
                status=status.HTTP_403_FORBIDDEN,
            )

        request_serializer = QuizGenerateSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        try:
            quiz = generate_quiz_for_course(
                course,
                count=request_serializer.validated_data["question_count"],
                difficulty=request_serializer.validated_data["difficulty_level"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        quiz = (
            Quiz.objects.filter(pk=quiz.pk)
            .select_related("course")
            .prefetch_related("questions")
            .annotate(question_count=Count("questions", distinct=True))
            .get()
        )
        serializer = QuizDetailSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LearnerQuizDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, quiz_pk):
        quiz = get_object_or_404(
            learner_quiz_queryset(request.user),
            pk=quiz_pk,
        )
        serializer = QuizDetailSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubmitQuizAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, quiz_pk):
        quiz = get_object_or_404(
            Quiz.objects.filter(
                course__status="active",
                course__classrooms__enrollments__student=request.user,
            )
            .prefetch_related("questions")
            .distinct(),
            pk=quiz_pk,
        )
        request_serializer = QuizSubmitSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        submitted_answers = {
            answer["question_id"]: answer["selected_option"].strip().upper()[:1]
            for answer in request_serializer.validated_data["answers"]
        }
        questions = list(quiz.questions.order_by("id"))
        correct_count = 0
        attempt = QuizAttempt.objects.create(student=request.user, quiz=quiz, score=0)

        answer_rows = []
        for question in questions:
            selected_option = submitted_answers.get(question.id, "")
            is_correct = selected_option == question.correct_option
            if is_correct:
                correct_count += 1
            answer_rows.append(
                QuizAnswer(
                    attempt=attempt,
                    question=question,
                    selected_option=selected_option,
                    is_correct=is_correct,
                )
            )
        QuizAnswer.objects.bulk_create(answer_rows)

        attempt.score = round((correct_count / len(questions)) * 100) if questions else 0
        attempt.save(update_fields=["score"])
        attempt = QuizAttempt.objects.prefetch_related("answers__question").get(pk=attempt.pk)
        serializer = QuizAttemptResultSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
