from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Classroom, ClassroomEnrollment, Course
from quizzes.models import Quiz, QuizAnswer, QuizAttempt, QuizQuestion

from .models import WeaknessReport

User = get_user_model()


class WeaknessReportAPITests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username="analytics-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.other_teacher = User.objects.create_user(
            username="other-analytics-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.student = User.objects.create_user(
            username="analytics-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.other_student = User.objects.create_user(
            username="other-analytics-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            title="Biology Basics",
            description="Intro biology.",
            subject="Biology",
            grade_level="10",
            status="active",
        )
        self.other_course = Course.objects.create(
            teacher=self.other_teacher,
            title="Geometry",
            description="Geometry basics.",
            subject="Math",
            grade_level="10",
            status="active",
        )
        self.classroom = Classroom.objects.create(
            course=self.course,
            name="Default Class",
        )
        ClassroomEnrollment.objects.create(
            student=self.student,
            classroom=self.classroom,
        )

    def create_quiz_attempt_with_wrong_answer(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Biology Quiz",
            difficulty_level="medium",
        )
        correct_question = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="Which organelle performs photosynthesis?",
            options=[{"key": "A", "text": "Chloroplast"}],
            correct_option="A",
            explanation="Chloroplasts perform photosynthesis.",
        )
        missed_question = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="What molecule carries genetic instructions?",
            options=[
                {"key": "B", "text": "DNA"},
                {"key": "C", "text": "RNA"},
            ],
            correct_option="B",
            explanation="DNA carries genetic instructions.",
        )
        attempt = QuizAttempt.objects.create(
            student=self.student,
            quiz=quiz,
            score=50,
        )
        QuizAnswer.objects.create(
            attempt=attempt,
            question=correct_question,
            selected_option="A",
            is_correct=True,
        )
        QuizAnswer.objects.create(
            attempt=attempt,
            question=missed_question,
            selected_option="C",
            is_correct=False,
        )

    def test_teacher_generates_weakness_report_from_quiz_answers(self):
        self.create_quiz_attempt_with_wrong_answer()
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-weakness-report-generate",
                kwargs={"course_pk": self.course.id},
            ),
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["student_id"], self.student.id)
        self.assertIn("missed 1 of 2", response.data[0]["weakness_summary"])
        self.assertEqual(len(response.data[0]["weak_topics"]), 1)
        self.assertEqual(response.data[0]["weak_topics"][0]["correct_option"], "B")
        self.assertEqual(response.data[0]["weak_topics"][0]["correct_choice"], "DNA")
        self.assertEqual(
            response.data[0]["weak_topics"][0]["selected_choices"],
            [{"key": "C", "text": "RNA"}],
        )
        self.assertEqual(WeaknessReport.objects.count(), 1)

    def test_teacher_lists_generated_weakness_reports_for_owned_course(self):
        report = WeaknessReport.objects.create(
            student=self.student,
            course=self.course,
            weakness_summary="Needs practice on genetics.",
            weak_topics=[{"topic": "Genetics"}],
        )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse(
                "course-weakness-report-list",
                kwargs={"course_pk": self.course.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [report.id])

    def test_teacher_generates_empty_state_report_when_student_has_no_attempts(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-weakness-report-generate",
                kwargs={"course_pk": self.course.id},
            ),
            {"student_id": self.student.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["weak_topics"], [])
        self.assertIn("No quiz attempts", response.data[0]["weakness_summary"])

    def test_generation_rejects_unenrolled_student(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse(
                "course-weakness-report-generate",
                kwargs={"course_pk": self.course.id},
            ),
            {"student_id": self.other_student.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_access_weakness_reports(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse(
                "course-weakness-report-list",
                kwargs={"course_pk": self.course.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_access_another_teachers_reports(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse(
                "course-weakness-report-list",
                kwargs={"course_pk": self.other_course.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
