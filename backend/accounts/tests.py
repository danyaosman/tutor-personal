from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import StudentProfile, TeacherProfile

User = get_user_model()


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.password = "StrongPassword123!"
        self.user = User.objects.create_user(
            username="existing-user",
            email="existing@example.com",
            password=self.password,
            role=User.STUDENT,
        )
        StudentProfile.objects.create(user=self.user, grade_level="10")

    def test_student_registration_creates_profile(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-student",
                "email": "student@example.com",
                "password": self.password,
                "first_name": "New",
                "last_name": "Student",
                "role": User.STUDENT,
                "grade_level": "11",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registered_user = User.objects.get(username="new-student")
        self.assertTrue(registered_user.check_password(self.password))
        self.assertTrue(
            StudentProfile.objects.filter(
                user=registered_user,
                grade_level="11",
            ).exists()
        )

    def test_student_registration_rejects_invalid_grade(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-student",
                "email": "student@example.com",
                "password": self.password,
                "first_name": "New",
                "last_name": "Student",
                "role": User.STUDENT,
                "grade_level": "13",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("grade_level", response.data)

    def test_teacher_registration_creates_profile(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-teacher",
                "email": "teacher@example.com",
                "password": self.password,
                "role": User.TEACHER,
                "bio": "Computer science tutor",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registered_user = User.objects.get(username="new-teacher")
        self.assertTrue(
            TeacherProfile.objects.filter(
                user=registered_user,
                bio="Computer science tutor",
            ).exists()
        )

    def test_registration_rejects_invalid_role(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "invalid-role",
                "email": "invalid@example.com",
                "password": self.password,
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_returns_new_access_token(self):
        login_response = self.client.post(
            reverse("login"),
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_returns_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["role"], User.STUDENT)

    def test_me_rejects_unauthenticated_request(self):
        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_profile_returns_and_updates_student_fields(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("profile"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], User.STUDENT)
        self.assertEqual(response.data["grade_level"], "10")
        self.assertNotIn("bio", response.data)

        update_response = self.client.patch(
            reverse("profile"),
            {
                "first_name": "Updated",
                "grade_level": "12",
                "bio": "Ignored student bio",
            },
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.user.student_profile.refresh_from_db()
        self.assertEqual(self.user.student_profile.grade_level, "12")
        self.assertFalse(hasattr(self.user, "teacher_profile"))

        invalid_update_response = self.client.patch(
            reverse("profile"),
            {"grade_level": "13"},
            format="json",
        )

        self.assertEqual(invalid_update_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("grade_level", invalid_update_response.data)

    def test_teacher_profile_returns_and_updates_teacher_fields(self):
        teacher = User.objects.create_user(
            username="settings-teacher",
            email="settings-teacher@example.com",
            password=self.password,
            role=User.TEACHER,
        )
        TeacherProfile.objects.create(user=teacher, bio="Original bio")
        self.client.force_authenticate(user=teacher)

        response = self.client.get(reverse("profile"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], User.TEACHER)
        self.assertEqual(response.data["bio"], "Original bio")
        self.assertNotIn("grade_level", response.data)

        update_response = self.client.patch(
            reverse("profile"),
            {
                "bio": "Updated bio",
                "teaching_style_summary": "Socratic and concise.",
                "ai_instructions": "Prefer examples from course PDFs.",
                "grade_level": "Ignored teacher grade",
            },
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        teacher.teacher_profile.refresh_from_db()
        self.assertEqual(teacher.teacher_profile.bio, "Updated bio")
        self.assertEqual(teacher.teacher_profile.teaching_style_summary, "Socratic and concise.")
        self.assertEqual(teacher.teacher_profile.ai_instructions, "Prefer examples from course PDFs.")

    def test_profile_rejects_unauthenticated_request(self):
        response = self.client.get(reverse("profile"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
