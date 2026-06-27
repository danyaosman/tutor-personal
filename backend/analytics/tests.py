from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ai_tutor.models import ChatMessage, ChatSession
from courses.models import Classroom, ClassroomEnrollment, Course, CourseResource
from flashcards.models import Flashcard, FlashcardSet
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

    def test_teacher_views_owned_weakness_report_detail(self):
        report = WeaknessReport.objects.create(
            student=self.student,
            course=self.course,
            weakness_summary="Needs practice on genetics.",
            weak_topics=[{"topic": "Genetics"}],
        )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("weakness-report-detail", kwargs={"report_pk": report.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], report.id)
        self.assertEqual(response.data["weakness_summary"], "Needs practice on genetics.")
        self.assertEqual(response.data["weak_topics"], [{"topic": "Genetics"}])

    def test_teacher_cannot_view_another_teachers_weakness_report_detail(self):
        other_classroom = Classroom.objects.create(
            course=self.other_course,
            name="Other Class",
        )
        ClassroomEnrollment.objects.create(
            student=self.other_student,
            classroom=other_classroom,
        )
        report = WeaknessReport.objects.create(
            student=self.other_student,
            course=self.other_course,
            weakness_summary="Hidden report.",
            weak_topics=[{"topic": "Geometry"}],
        )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("weakness-report-detail", kwargs={"report_pk": report.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

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

    def test_tutor_overview_returns_owned_course_activity(self):
        self.create_quiz_attempt_with_wrong_answer()
        WeaknessReport.objects.create(
            student=self.student,
            course=self.course,
            weakness_summary="Needs genetics practice.",
            weak_topics=[{"topic": "DNA"}],
        )
        CourseResource.objects.create(
            course=self.course,
            file_name="biology.pdf",
            file="course_resources/biology.pdf",
            file_size=123,
            processing_status="completed",
        )
        chat_session = ChatSession.objects.create(student=self.student, course=self.course)
        ChatMessage.objects.create(
            session=chat_session,
            sender="student",
            message_text="What is DNA?",
        )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(reverse("tutor-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["course_count"], 1)
        self.assertEqual(response.data["summary"]["student_count"], 1)
        self.assertEqual(response.data["summary"]["quiz_attempt_count"], 1)
        self.assertEqual(response.data["summary"]["average_score"], 50.0)
        self.assertEqual(response.data["summary"]["weak_topic_count"], 1)
        self.assertEqual(response.data["summary"]["student_chat_message_count"], 1)
        self.assertEqual(response.data["course_activity"][0]["title"], self.course.title)

    def test_tutor_overview_limits_recent_activity_to_three_items(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Recent Activity Quiz",
            difficulty_level="medium",
        )
        for index in range(4):
            QuizAttempt.objects.create(
                student=self.student,
                quiz=quiz,
                score=50 + index,
            )
            WeaknessReport.objects.create(
                student=self.student,
                course=self.course,
                weakness_summary=f"Report {index}",
                weak_topics=[{"topic": f"Topic {index}"}],
            )
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(reverse("tutor-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["recent_attempts"]), 3)
        self.assertEqual(len(response.data["recent_reports"]), 3)

    def test_student_cannot_access_tutor_overview(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("tutor-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_learner_overview_returns_own_activity(self):
        self.create_quiz_attempt_with_wrong_answer()
        card_set = FlashcardSet.objects.create(
            student=self.student,
            course=self.course,
            title="Biology Cards",
        )
        Flashcard.objects.create(set=card_set, front="DNA", back="Genetic material")
        chat_session = ChatSession.objects.create(student=self.student, course=self.course)
        ChatMessage.objects.create(
            session=chat_session,
            sender="student",
            message_text="Summarize genetics.",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("learner-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["enrolled_course_count"], 1)
        self.assertEqual(response.data["summary"]["quiz_attempt_count"], 1)
        self.assertEqual(response.data["summary"]["best_score"], 50)
        self.assertEqual(response.data["summary"]["flashcard_card_count"], 1)
        self.assertEqual(response.data["summary"]["student_chat_message_count"], 1)
        self.assertEqual(response.data["course_progress"][0]["title"], self.course.title)

    def test_learner_overview_limits_recent_attempts_to_three_items(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Learner Recent Quiz",
            difficulty_level="medium",
        )
        for index in range(4):
            QuizAttempt.objects.create(
                student=self.student,
                quiz=quiz,
                score=60 + index,
            )
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("learner-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["recent_attempts"]), 3)

    def test_teacher_cannot_access_learner_overview(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(reverse("learner-analytics-overview"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
