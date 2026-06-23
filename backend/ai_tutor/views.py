from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent
from ai_tutor.models import ChatMessage, ChatSession
from ai_tutor.serializers import (
    CourseChatRequestSerializer,
    CourseChatResponseSerializer,
)
from ai_tutor.services.chat_service import answer_course_question
from courses.models import ClassroomEnrollment, Course


class CourseChatView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk, status="active")
        if not ClassroomEnrollment.objects.filter(
            student=request.user,
            classroom__course=course,
        ).exists():
            return Response(
                {"detail": "Enroll in this course before asking the AI tutor."},
                status=status.HTTP_403_FORBIDDEN,
            )
        request_serializer = CourseChatRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        question = request_serializer.validated_data["message"]
        answer, sources = answer_course_question(course, question)

        session = ChatSession.objects.create(
            student=request.user,
            course=course,
        )
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
