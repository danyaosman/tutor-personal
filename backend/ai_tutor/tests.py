from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import TeacherProfile
from analytics.models import TeachingStyleExample
from ai_tutor.models import ChatMessage, ChatSession, ResourceChunk
from courses.models import Classroom, ClassroomEnrollment, Course, CourseResource

User = get_user_model()


@override_settings(AI_API_KEY="")
class CourseChatAPITests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username="chat-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.student = User.objects.create_user(
            username="chat-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            title="Python Basics",
            description="Learn Python.",
            subject="Computer Science",
            grade_level="10",
            status="active",
        )
        self.draft_course = Course.objects.create(
            teacher=self.teacher,
            title="Draft Python",
            description="Hidden course.",
            subject="Computer Science",
            grade_level="10",
            status="draft",
        )
        self.resource = CourseResource.objects.create(
            course=self.course,
            file_name="python-notes.pdf",
            file="course_resources/python-notes.pdf",
            file_size=1234,
            processing_status="completed",
        )
        ResourceChunk.objects.create(
            resource=self.resource,
            chunk_index=0,
            page_number=1,
            content="Python variables store values and functions reuse instructions.",
        )
        self.classroom = Classroom.objects.create(
            course=self.course,
            name="Default Class",
        )

    def test_student_chats_with_active_course_resources(self):
        self.client.force_authenticate(user=self.student)
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "What are Python variables?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Python variables", response.data["answer"])
        self.assertNotIn("file_name", response.data["sources"][0])
        self.assertEqual(response.data["sources"][0]["page_number"], 1)
        self.assertIn("Python variables", response.data["sources"][0]["preview"])
        self.assertEqual(ChatSession.objects.count(), 1)
        self.assertEqual(ChatSession.objects.first().title, "What are Python variables?")
        self.assertEqual(ChatMessage.objects.count(), 2)

    def test_chat_history_uses_first_question_as_session_title(self):
        self.client.force_authenticate(user=self.student)
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )

        chat_response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "How do Python functions reuse instructions?"},
            format="json",
        )
        session_id = chat_response.data["session_id"]

        second_response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {
                "message": "Can you give me another example?",
                "session_id": session_id,
            },
            format="json",
        )
        list_response = self.client.get(
            reverse("student-course-chat-sessions", kwargs={"course_pk": self.course.id})
        )
        detail_response = self.client.get(
            reverse("student-chat-session-detail", kwargs={"session_pk": session_id})
        )

        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list_response.data[0]["title"],
            "How do Python functions reuse instructions?",
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            detail_response.data["title"],
            "How do Python functions reuse instructions?",
        )

    def test_chat_session_title_is_truncated_from_long_first_question(self):
        self.client.force_authenticate(user=self.student)
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )
        long_question = (
            "Can you explain Python variables, assignments, functions, return values, "
            "and how they all work together in one beginner friendly example?"
        )

        self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": long_question},
            format="json",
        )

        session = ChatSession.objects.first()
        self.assertLessEqual(len(session.title), 80)
        self.assertTrue(session.title.endswith("..."))

    @override_settings(
        AI_PROVIDER="openrouter",
        AI_API_KEY="test-ai-key",
        AI_BASE_URL="https://openrouter.ai/api/v1",
        AI_MODEL="test-model",
        AI_REQUEST_TIMEOUT=5,
        AI_SITE_URL="http://localhost:5173",
        AI_APP_NAME="EduMind Tests",
    )
    @patch("ai_tutor.services.chat_service.requests.post")
    def test_student_chat_uses_ai_provider_when_api_key_exists(self, mock_post):
        mock_response = mock_post.return_value
        mock_response.ok = True
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": "Python variables are names that store values."
                    }
                }
            ]
        }
        self.client.force_authenticate(user=self.student)
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "What are Python variables?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["answer"],
            "Python variables are names that store values.",
        )
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        self.assertEqual(
            mock_post.call_args.args[0],
            "https://openrouter.ai/api/v1/chat/completions",
        )
        self.assertEqual(call_kwargs["headers"]["Authorization"], "Bearer test-ai-key")
        self.assertEqual(call_kwargs["headers"]["X-OpenRouter-Title"], "EduMind Tests")
        self.assertEqual(call_kwargs["json"]["model"], "test-model")
        self.assertIn("Python variables", call_kwargs["json"]["messages"][1]["content"])

    @override_settings(
        AI_PROVIDER="openrouter",
        AI_API_KEY="test-ai-key",
        AI_BASE_URL="https://openrouter.ai/api/v1",
        AI_MODEL="test-model",
        AI_REQUEST_TIMEOUT=5,
        AI_SITE_URL="http://localhost:5173",
        AI_APP_NAME="EduMind Tests",
    )
    @patch("ai_tutor.services.chat_service.requests.post")
    def test_student_chat_includes_teacher_style_context(self, mock_post):
        TeacherProfile.objects.create(
            user=self.teacher,
            teaching_style_summary="Use Socratic hints before direct answers.",
            ai_instructions="Always include a quick checkpoint question.",
        )
        TeachingStyleExample.objects.create(
            teacher=self.teacher,
            course=self.course,
            example_text="First give a tiny analogy, then connect it back to code.",
            source_file_url="",
        )
        style_resource = CourseResource.objects.create(
            course=self.course,
            file_name="teaching-style.pdf",
            file="course_resources/teaching-style.pdf",
            file_size=1234,
            is_style_example=True,
            processing_status="completed",
        )
        ResourceChunk.objects.create(
            resource=style_resource,
            chunk_index=0,
            page_number=1,
            content="Explain with a friendly analogy before the technical definition.",
        )
        mock_response = mock_post.return_value
        mock_response.ok = True
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Styled answer."}}]
        }
        self.client.force_authenticate(user=self.student)
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "What are Python variables?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        system_prompt = mock_post.call_args.kwargs["json"]["messages"][0]["content"]
        self.assertIn("Socratic hints", system_prompt)
        self.assertIn("checkpoint question", system_prompt)
        self.assertIn("tiny analogy", system_prompt)
        self.assertIn("teaching-style.pdf", system_prompt)
        self.assertIn("friendly analogy", system_prompt)
        user_prompt = mock_post.call_args.kwargs["json"]["messages"][1]["content"]
        self.assertIn("python-notes.pdf", user_prompt)
        self.assertNotIn("teaching-style.pdf", user_prompt)

    def test_student_must_enroll_before_chatting(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "What are Python variables?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_chat_with_draft_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.draft_course.id}),
            {"message": "Can I see this?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tutor_cannot_use_learner_chat_endpoint(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": "What are variables?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_message_is_required(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-chat", kwargs={"course_pk": self.course.id}),
            {"message": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
