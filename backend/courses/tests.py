import shutil
import tempfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analytics.models import TeachingStyleExample
from ai_tutor.models import ChatMessage, ChatSession
from ai_tutor.models import ResourceChunk
from ai_tutor.services.pdf_service import PDFPageText
from flashcards.models import Flashcard, FlashcardSet
from quizzes.models import Quiz, QuizAnswer, QuizAttempt, QuizQuestion

from .models import Classroom, ClassroomEnrollment, Course, CourseResource, Syllabus

User = get_user_model()


class CourseAPITests(APITestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp()
        self.media_override = override_settings(MEDIA_ROOT=self.media_root)
        self.media_override.enable()
        self.addCleanup(self.media_override.disable)
        self.addCleanup(shutil.rmtree, self.media_root, True)
        self.teacher = User.objects.create_user(
            username="course-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.other_teacher = User.objects.create_user(
            username="other-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.student = User.objects.create_user(
            username="course-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            title="Intro to Python",
            description="Learn Python fundamentals.",
            subject="Computer Science",
            grade_level="10",
            status="draft",
        )
        self.other_course = Course.objects.create(
            teacher=self.other_teacher,
            title="Algebra",
            description="Learn algebra fundamentals.",
            subject="Mathematics",
            grade_level="9",
            status="active",
        )

    def test_tutor_lists_only_owned_courses(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(reverse("course-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([course["id"] for course in response.data], [self.course.id])

    def test_tutor_creates_course_owned_by_them(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse("course-list-create"),
            {
                "title": "Data Structures",
                "description": "Core data structures and algorithms.",
                "subject": "Computer Science",
                "grade_level": "11",
                "status": "Draft",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_course = Course.objects.get(id=response.data["id"])
        self.assertEqual(created_course.teacher, self.teacher)
        self.assertEqual(created_course.status, "draft")

    def test_tutor_cannot_create_course_with_invalid_grade(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse("course-list-create"),
            {
                "title": "Data Structures",
                "description": "Core data structures and algorithms.",
                "subject": "Computer Science",
                "grade_level": "13",
                "status": "draft",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("grade_level", response.data)

    def test_student_cannot_manage_courses(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("course-list-create"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_tutor_cannot_access_another_tutors_course(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("course-detail", kwargs={"pk": self.other_course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tutor_updates_course_status(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.patch(
            reverse("course-detail", kwargs={"pk": self.course.id}),
            {"status": "active"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "active")

    def test_tutor_deletes_owned_course(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.delete(
            reverse("course-detail", kwargs={"pk": self.course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(id=self.course.id).exists())

    def test_student_catalog_lists_only_active_courses(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("available-course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([course["id"] for course in response.data], [self.other_course.id])
        self.assertFalse(response.data[0]["is_enrolled"])

    def test_student_enrolls_in_active_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-enroll", kwargs={"course_pk": self.other_course.id}),
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_enrolled"])
        self.assertTrue(
            ClassroomEnrollment.objects.filter(
                student=self.student,
                classroom__course=self.other_course,
            ).exists()
        )

    def test_student_unenrolls_from_course(self):
        classroom = Classroom.objects.create(course=self.other_course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=classroom)
        self.client.force_authenticate(user=self.student)

        response = self.client.delete(
            reverse("course-enroll", kwargs={"course_pk": self.other_course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            ClassroomEnrollment.objects.filter(
                student=self.student,
                classroom__course=self.other_course,
            ).exists()
        )

    def test_student_cannot_unenroll_from_course_they_are_not_enrolled_in(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.delete(
            reverse("course-enroll", kwargs={"course_pk": self.other_course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_enrolled_courses_lists_only_their_courses(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(
            reverse("course-enroll", kwargs={"course_pk": self.other_course.id}),
            {},
            format="json",
        )

        response = self.client.get(reverse("enrolled-course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([course["id"] for course in response.data], [self.other_course.id])
        self.assertTrue(response.data[0]["is_enrolled"])

    def test_student_cannot_enroll_in_draft_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-enroll", kwargs={"course_pk": self.course.id}),
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tutor_cannot_use_student_catalog(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(reverse("available-course-list"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_list_courses(self):
        response = self.client.get(reverse("course-list-create"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tutor_uploads_and_lists_pdf_resource(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse(
            "course-resource-list-create",
            kwargs={"course_pk": self.course.id},
        )

        upload_response = self.client.post(
            url,
            {
                "file": SimpleUploadedFile(
                    "python-notes.pdf",
                    b"%PDF-1.4 demo content",
                    content_type="application/pdf",
                )
            },
            format="multipart",
        )
        list_response = self.client.get(url)

        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(upload_response.data["file_name"], "python-notes.pdf")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    @patch("ai_tutor.services.chunk_service.extract_pdf_pages")
    def test_resource_upload_extracts_pdf_text_into_chunks(self, extract_pdf_pages):
        extract_pdf_pages.return_value = [
            PDFPageText(
                page_number=1,
                content="Python variables store values for later use.",
            ),
            PDFPageText(
                page_number=2,
                content="Functions group reusable instructions.",
            ),
        ]
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-resource-list-create",
                kwargs={"course_pk": self.course.id},
            ),
            {
                "file": SimpleUploadedFile(
                    "python-notes.pdf",
                    b"%PDF-1.4 demo content",
                    content_type="application/pdf",
                )
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["processing_status"], "completed")
        resource = CourseResource.objects.get(id=response.data["id"])
        self.assertEqual(resource.chunks.count(), 2)
        self.assertEqual(
            list(resource.chunks.order_by("chunk_index").values_list("page_number", flat=True)),
            [1, 2],
        )

    @patch("ai_tutor.services.chunk_service.extract_pdf_pages")
    def test_resource_upload_marks_processing_failed_when_pdf_text_extraction_fails(
        self,
        extract_pdf_pages,
    ):
        extract_pdf_pages.side_effect = ValueError("Unreadable PDF")
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-resource-list-create",
                kwargs={"course_pk": self.course.id},
            ),
            {
                "file": SimpleUploadedFile(
                    "scanned-notes.pdf",
                    b"%PDF-1.4 scanned content",
                    content_type="application/pdf",
                )
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["processing_status"], "failed")
        self.assertEqual(ResourceChunk.objects.count(), 0)

    def test_tutor_updates_resource_metadata(self):
        self.client.force_authenticate(user=self.teacher)
        resource = CourseResource.objects.create(
            course=self.course,
            file_name="python-notes.pdf",
            file="course_resources/python-notes.pdf",
            file_size=1234,
        )

        response = self.client.patch(
            reverse(
                "course-resource-detail",
                kwargs={"course_pk": self.course.id, "pk": resource.id},
            ),
            {"file_name": "Renamed Python Notes.pdf", "is_style_example": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resource.refresh_from_db()
        self.assertEqual(resource.file_name, "Renamed Python Notes.pdf")
        self.assertTrue(resource.is_style_example)

    def test_tutor_deletes_resource(self):
        self.client.force_authenticate(user=self.teacher)
        resource = CourseResource.objects.create(
            course=self.course,
            file_name="python-notes.pdf",
            file="course_resources/python-notes.pdf",
            file_size=1234,
        )

        response = self.client.delete(
            reverse(
                "course-resource-detail",
                kwargs={"course_pk": self.course.id, "pk": resource.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CourseResource.objects.filter(id=resource.id).exists())

    def test_tutor_cannot_access_another_tutors_resource(self):
        self.client.force_authenticate(user=self.teacher)
        resource = CourseResource.objects.create(
            course=self.other_course,
            file_name="algebra.pdf",
            file="course_resources/algebra.pdf",
            file_size=1234,
        )

        response = self.client.patch(
            reverse(
                "course-resource-detail",
                kwargs={"course_pk": self.other_course.id, "pk": resource.id},
            ),
            {"file_name": "Hidden Algebra.pdf"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_learner_cannot_list_uploaded_course_resources(self):
        classroom = Classroom.objects.create(course=self.course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=classroom)
        self.course.status = "active"
        self.course.save(update_fields=["status"])
        CourseResource.objects.create(
            course=self.course,
            file_name="python-content.pdf",
            file="course_resources/python-content.pdf",
            file_size=1234,
            processing_status="completed",
        )
        CourseResource.objects.create(
            course=self.course,
            file_name="teacher-style.pdf",
            file="course_resources/teacher-style.pdf",
            file_size=1234,
            is_style_example=True,
            processing_status="completed",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("learner-course-resource-list", kwargs={"course_pk": self.course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_tutor_retrieves_edits_and_generates_owned_course_syllabus(self):
        CourseResource.objects.create(
            course=self.course,
            file_name="python-notes.pdf",
            file="course_resources/python-notes.pdf",
            file_size=1234,
            processing_status="completed",
        )
        self.client.force_authenticate(user=self.teacher)

        detail_url = reverse("course-syllabus", kwargs={"course_pk": self.course.id})
        generate_url = reverse(
            "course-syllabus-generate",
            kwargs={"course_pk": self.course.id},
        )

        empty_response = self.client.get(detail_url)
        generate_response = self.client.post(
            generate_url,
            {"notes": "Spend extra time on functions."},
            format="json",
        )
        edit_response = self.client.patch(
            detail_url,
            {"edited_content": "Custom Python syllabus"},
            format="json",
        )

        self.assertEqual(empty_response.status_code, status.HTTP_200_OK)
        self.assertEqual(empty_response.data["content"], "")
        self.assertEqual(generate_response.status_code, status.HTTP_200_OK)
        self.assertIn("Intro to Python Syllabus", generate_response.data["content"])
        self.assertIn("python-notes.pdf", generate_response.data["content"])
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_response.data["content"], "Custom Python syllabus")
        self.assertEqual(Syllabus.objects.get(course=self.course).edited_content, "Custom Python syllabus")

    def test_tutor_cannot_manage_another_tutors_syllabus(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("course-syllabus", kwargs={"course_pk": self.other_course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_manage_course_syllabus(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("course-syllabus", kwargs={"course_pk": self.course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_tutor_creates_and_lists_teaching_style_examples_for_owned_course(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse(
            "course-teaching-style-example-list-create",
            kwargs={"course_pk": self.course.id},
        )

        create_response = self.client.post(
            url,
            {
                "example_text": "Use short analogies and then ask a check question.",
                "source_file_url": "https://example.com/style-note",
            },
            format="json",
        )
        list_response = self.client.get(url)

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeachingStyleExample.objects.count(), 1)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data[0]["course_id"], self.course.id)
        self.assertIn("short analogies", list_response.data[0]["example_text"])

    def test_tutor_updates_and_deletes_owned_teaching_style_example(self):
        example = TeachingStyleExample.objects.create(
            teacher=self.teacher,
            course=self.course,
            example_text="Use old style.",
            source_file_url="",
        )
        self.client.force_authenticate(user=self.teacher)
        url = reverse(
            "course-teaching-style-example-detail",
            kwargs={"course_pk": self.course.id, "pk": example.id},
        )

        update_response = self.client.patch(
            url,
            {"example_text": "Use updated style."},
            format="json",
        )
        delete_response = self.client.delete(url)

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["example_text"], "Use updated style.")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TeachingStyleExample.objects.filter(id=example.id).exists())

    def test_tutor_cannot_create_teaching_style_example_for_another_tutors_course(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-teaching-style-example-list-create",
                kwargs={"course_pk": self.other_course.id},
            ),
            {"example_text": "Hidden style."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_resource_upload_rejects_non_pdf(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-resource-list-create",
                kwargs={"course_pk": self.course.id},
            ),
            {
                "file": SimpleUploadedFile(
                    "notes.txt",
                    b"Not a PDF",
                    content_type="text/plain",
                )
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

    def test_tutor_cannot_upload_to_another_tutors_course(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-resource-list-create",
                kwargs={"course_pk": self.other_course.id},
            ),
            {
                "file": SimpleUploadedFile(
                    "algebra.pdf",
                    b"%PDF-1.4 demo content",
                    content_type="application/pdf",
                )
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tutor_lists_students_enrolled_in_owned_course(self):
        classroom = Classroom.objects.create(course=self.course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=classroom)
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("course-student-list", kwargs={"course_pk": self.course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.student.id)
        self.assertEqual(response.data[0]["username"], self.student.username)
        self.assertIn("enrolled_at", response.data[0])

    def test_tutor_cannot_list_students_for_another_tutors_course(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("course-student-list", kwargs={"course_pk": self.other_course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_list_course_students(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("course-student-list", kwargs={"course_pk": self.course.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_tutor_views_enrolled_student_progress(self):
        classroom = Classroom.objects.create(course=self.course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=classroom)
        quiz = Quiz.objects.create(
            course=self.course,
            title="Python Practice Quiz",
            difficulty_level="medium",
        )
        question_one = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="What stores values in Python?",
            options=[{"key": "A", "text": "Variables"}],
            correct_option="A",
            explanation="Variables store values.",
        )
        question_two = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="What groups reusable instructions?",
            options=[{"key": "B", "text": "Functions"}],
            correct_option="B",
            explanation="Functions are reusable.",
        )
        attempt = QuizAttempt.objects.create(student=self.student, quiz=quiz, score=50)
        QuizAnswer.objects.create(
            attempt=attempt,
            question=question_one,
            selected_option="A",
            is_correct=True,
        )
        QuizAnswer.objects.create(
            attempt=attempt,
            question=question_two,
            selected_option="C",
            is_correct=False,
        )
        card_set = FlashcardSet.objects.create(
            course=self.course,
            student=self.student,
            title="Python Cards",
        )
        Flashcard.objects.create(set=card_set, front="Variable", back="Stores values")
        chat_session = ChatSession.objects.create(student=self.student, course=self.course)
        ChatMessage.objects.create(
            session=chat_session,
            sender="student",
            message_text="Explain functions.",
        )
        ChatMessage.objects.create(
            session=chat_session,
            sender="ai",
            message_text="Functions group reusable instructions.",
        )
        second_course = Course.objects.create(
            teacher=self.teacher,
            title="Advanced Python",
            description="Go deeper with Python.",
            subject="Computer Science",
            grade_level="11",
            status="active",
        )
        second_classroom = Classroom.objects.create(
            course=second_course,
            name="Advanced Section",
        )
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=second_classroom,
        )
        other_teacher_classroom = Classroom.objects.create(
            course=self.other_course,
            name="Other Teacher Section",
        )
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=other_teacher_classroom,
        )
        second_quiz = Quiz.objects.create(
            course=second_course,
            title="Advanced Quiz",
            difficulty_level="medium",
        )
        QuizAttempt.objects.create(student=self.student, quiz=second_quiz, score=80)
        CourseResource.objects.create(
            course=self.course,
            file_name="python.pdf",
            file="course_resources/python.pdf",
            file_size=123,
            processing_status="completed",
        )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse(
                "course-student-progress",
                kwargs={"course_pk": self.course.id, "student_pk": self.student.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["student"]["id"], self.student.id)
        self.assertEqual(response.data["quiz_progress"]["quiz_count"], 1)
        self.assertEqual(response.data["quiz_progress"]["attempt_count"], 1)
        self.assertEqual(response.data["quiz_progress"]["best_score"], 50)
        self.assertEqual(response.data["quiz_progress"]["average_score"], 50.0)
        self.assertEqual(response.data["quiz_progress"]["answered_question_count"], 2)
        self.assertEqual(response.data["quiz_progress"]["correct_answer_count"], 1)
        self.assertEqual(response.data["learning_activity"]["flashcard_set_count"], 1)
        self.assertEqual(response.data["learning_activity"]["flashcard_card_count"], 1)
        self.assertEqual(response.data["learning_activity"]["chat_session_count"], 1)
        self.assertEqual(response.data["learning_activity"]["chat_message_count"], 1)
        self.assertEqual(response.data["learning_activity"]["completed_resource_count"], 1)
        self.assertEqual(
            response.data["teacher_course_progress"]["summary"]["course_count"],
            2,
        )
        self.assertEqual(
            response.data["teacher_course_progress"]["summary"]["attempt_count"],
            2,
        )
        self.assertEqual(
            response.data["teacher_course_progress"]["summary"]["student_chat_message_count"],
            1,
        )
        self.assertEqual(
            [course["course"]["title"] for course in response.data["teacher_course_progress"]["courses"]],
            ["Advanced Python", "Intro to Python"],
        )

    def test_tutor_cannot_view_progress_for_unenrolled_student(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse(
                "course-student-progress",
                kwargs={"course_pk": self.course.id, "student_pk": self.student.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
