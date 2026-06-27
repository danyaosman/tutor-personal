from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent
from courses.models import ClassroomEnrollment, Course
from .models import FlashcardSet
from .serializers import (
    FlashcardGenerateSerializer,
    FlashcardSetDetailSerializer,
    FlashcardSetListSerializer,
)
from .services import generate_flashcard_set_for_course


def get_enrolled_course(user, course_pk):
    course = get_object_or_404(Course, pk=course_pk, status="active")
    if not ClassroomEnrollment.objects.filter(
        student=user,
        classroom__course=course,
    ).exists():
        return None
    return course


def learner_flashcard_set_queryset(user):
    return (
        FlashcardSet.objects.filter(
            student=user,
            course__status="active",
            course__classrooms__enrollments__student=user,
        )
        .select_related("course")
        .prefetch_related("cards")
        .annotate(card_count=Count("cards", distinct=True))
        .distinct()
        .order_by("-created_at")
    )


class LearnerFlashcardSetListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        serializer = FlashcardSetListSerializer(
            learner_flashcard_set_queryset(request.user),
            many=True,
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class GenerateFlashcardSetView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, course_pk):
        course = get_enrolled_course(request.user, course_pk)
        if not course:
            return Response(
                {"detail": "Enroll in this course before generating flashcards."},
                status=status.HTTP_403_FORBIDDEN,
            )

        request_serializer = FlashcardGenerateSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        try:
            card_set = generate_flashcard_set_for_course(
                request.user,
                course,
                count=request_serializer.validated_data["card_count"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        card_set = (
            FlashcardSet.objects.filter(pk=card_set.pk)
            .select_related("course")
            .prefetch_related("cards")
            .annotate(card_count=Count("cards", distinct=True))
            .get()
        )
        serializer = FlashcardSetDetailSerializer(card_set)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LearnerFlashcardSetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, set_pk):
        card_set = get_object_or_404(
            learner_flashcard_set_queryset(request.user),
            pk=set_pk,
        )
        serializer = FlashcardSetDetailSerializer(card_set)
        return Response(serializer.data, status=status.HTTP_200_OK)
