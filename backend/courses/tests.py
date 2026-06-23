import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course

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
