import shutil
import tempfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ai_tutor.models import ResourceChunk
from ai_tutor.services.pdf_service import PDFPageText

from .models import ClassroomEnrollment, Course, CourseResource

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
