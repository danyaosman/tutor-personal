from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent
from ai_tutor.models import ChatMessage, ChatSession
from ai_tutor.serializers import (
    ChatSessionDetailSerializer,
    ChatSessionListSerializer,
    CourseChatRequestSerializer,
    CourseChatResponseSerializer,
)
from ai_tutor.services.chat_service import answer_course_question
from courses.models import ClassroomEnrollment, Course


def build_chat_title(question):
    normalized_title = " ".join(question.split())
    if len(normalized_title) > 80:
        return f"{normalized_title[:77].rstrip()}..."
    return normalized_title


class CourseChatView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, status="active")

        request_serializer = CourseChatRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        if not ClassroomEnrollment.objects.filter(
            student=request.user,
            classroom__course=course,
        ).exists():
            return Response(
                {"detail": "Enroll in this course before asking the AI tutor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        question = request_serializer.validated_data["message"]
        session_id = request_serializer.validated_data.get("session_id")

        if session_id:
            session = get_object_or_404(
                ChatSession,
                id=session_id,
                student=request.user,
                course=course,
            )
        else:
            session = ChatSession.objects.create(
                student=request.user,
                course=course,
                title=build_chat_title(question),
            )

        answer, sources = answer_course_question(course, question)

        ChatMessage.objects.create(
            session=session,
            sender="student",
            message_text=question,
        )

        ChatMessage.objects.create(
            session=session,
            sender="ai",
            message_text=answer,
            source_references=sources,
        )

        response_serializer = CourseChatResponseSerializer(
            {
                "session_id": session.id,
                "message": question,
                "answer": answer,
                "sources": sources,
            }
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

class StudentCourseChatSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, status="active")

        if not ClassroomEnrollment.objects.filter(
            student=request.user,
            classroom__course=course,
        ).exists():
            return Response(
                {"detail": "Enroll in this course before viewing chat history."},
                status=status.HTTP_403_FORBIDDEN,
            )

        sessions = (
            ChatSession.objects.filter(
                student=request.user,
                course=course,
            )
            .prefetch_related("messages")
            .order_by("-created_at")
        )

        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentChatSessionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, session_pk):
        session = get_object_or_404(
            ChatSession.objects.prefetch_related("messages"),
            id=session_pk,
            student=request.user,
        )

        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)
