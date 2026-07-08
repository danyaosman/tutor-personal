from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ai_tutor.models import ResourceChunk
from courses.models import Classroom, ClassroomEnrollment, Course, CourseResource
from .models import Quiz, QuizAnswer, QuizAttempt, QuizQuestion

User = get_user_model()


@override_settings(AI_API_KEY="")
class QuizAPITests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username="quiz-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.student = User.objects.create_user(
            username="quiz-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.other_student = User.objects.create_user(
            username="quiz-other-student",
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
            content="Python variables store values for later use in programs. Functions group reusable instructions.",
        )
        ResourceChunk.objects.create(
            resource=self.resource,
            chunk_index=1,
            page_number=2,
            content="Loops repeat instructions while conditions control program flow.",
        )
        self.classroom = Classroom.objects.create(course=self.course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=self.classroom)

    def create_attempt(self, student=None, course=None):
        quiz = Quiz.objects.create(
            course=course or self.course,
            title="Python Practice",
            difficulty_level="medium",
        )
        question = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="Which option describes a variable?",
            options=[
                {"key": "A", "text": "Stores a value."},
                {"key": "B", "text": "Deletes the program."},
            ],
            correct_option="A",
            explanation="Variables store values.",
        )
        attempt = QuizAttempt.objects.create(
            student=student or self.student,
            quiz=quiz,
            score=100,
        )
        QuizAnswer.objects.create(
            attempt=attempt,
            question=question,
            selected_option="A",
            is_correct=True,
        )
        return attempt

    def test_student_generates_quiz_from_enrolled_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("generate-course-quiz", kwargs={"course_pk": self.course.id}),
            {"question_count": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["questions"]), 3)
        self.assertEqual(Quiz.objects.count(), 1)
        self.assertEqual(QuizQuestion.objects.count(), 3)

    def test_student_cannot_generate_quiz_before_enrollment(self):
        self.client.force_authenticate(user=self.other_student)

        response = self.client.post(
            reverse("generate-course-quiz", kwargs={"course_pk": self.course.id}),
            {"question_count": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_quiz_generation_requires_processed_resources(self):
        self.resource.processing_status = "failed"
        self.resource.save(update_fields=["processing_status"])
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("generate-course-quiz", kwargs={"course_pk": self.course.id}),
            {"question_count": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("processed course resources", response.data["detail"])

    def test_student_lists_and_views_enrolled_course_quizzes(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Python Practice",
            difficulty_level="medium",
        )
        QuizQuestion.objects.create(
            quiz=quiz,
            question_text="Which option describes a variable?",
            options=[
                {"key": "A", "text": "Stores a value."},
                {"key": "B", "text": "Deletes the program."},
                {"key": "C", "text": "Skips all code."},
                {"key": "D", "text": "Ignores data."},
            ],
            correct_option="A",
            explanation="Variables store values.",
        )
        self.client.force_authenticate(user=self.student)

        list_response = self.client.get(reverse("learner-quiz-list"))
        detail_response = self.client.get(
            reverse("learner-quiz-detail", kwargs={"quiz_pk": quiz.id})
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data[0]["id"], quiz.id)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertNotIn("correct_option", detail_response.data["questions"][0])

    def test_student_quiz_list_includes_only_latest_attempt_pointer(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Python Practice",
            difficulty_level="medium",
        )
        first_attempt = QuizAttempt.objects.create(student=self.student, quiz=quiz, score=25)
        latest_attempt = QuizAttempt.objects.create(student=self.student, quiz=quiz, score=75)
        self.client.force_authenticate(user=self.student)

        response = self.client.get(reverse("learner-quiz-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["attempt_count"], 2)
        self.assertEqual(response.data[0]["latest_attempt_id"], latest_attempt.id)
        self.assertNotEqual(response.data[0]["latest_attempt_id"], first_attempt.id)
        self.assertIn("latest_attempt_at", response.data[0])

    def test_student_submits_quiz_attempt_and_receives_results(self):
        quiz = Quiz.objects.create(
            course=self.course,
            title="Python Practice",
            difficulty_level="medium",
        )
        question = QuizQuestion.objects.create(
            quiz=quiz,
            question_text="Which option describes a variable?",
            options=[
                {"key": "A", "text": "Stores a value."},
                {"key": "B", "text": "Deletes the program."},
                {"key": "C", "text": "Skips all code."},
                {"key": "D", "text": "Ignores data."},
            ],
            correct_option="A",
            explanation="Variables store values.",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("submit-quiz-attempt", kwargs={"quiz_pk": quiz.id}),
            {"answers": [{"question_id": question.id, "selected_option": "A"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["score"], 100)
        self.assertEqual(QuizAttempt.objects.count(), 1)
        self.assertEqual(QuizAnswer.objects.count(), 1)
        self.assertTrue(response.data["answers"][0]["is_correct"])

    def test_tutor_cannot_use_learner_quiz_generation(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse("generate-course-quiz", kwargs={"course_pk": self.course.id}),
            {"question_count": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_views_own_quiz_attempt_detail(self):
        attempt = self.create_attempt()
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("quiz-attempt-detail", kwargs={"attempt_pk": attempt.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], attempt.id)
        self.assertEqual(response.data["quiz_title"], "Python Practice")
        self.assertEqual(response.data["course_title"], self.course.title)
        self.assertEqual(response.data["student_id"], self.student.id)
        self.assertEqual(response.data["answers"][0]["question"]["correct_option"], "A")

    def test_student_cannot_view_other_students_quiz_attempt_detail(self):
        attempt = self.create_attempt(student=self.other_student)
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("quiz-attempt-detail", kwargs={"attempt_pk": attempt.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_teacher_views_owned_course_quiz_attempt_detail(self):
        attempt = self.create_attempt()
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("quiz-attempt-detail", kwargs={"attempt_pk": attempt.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["student_name"], self.student.username)
        self.assertEqual(response.data["score"], 100)

    def test_teacher_cannot_view_another_teachers_quiz_attempt_detail(self):
        other_teacher = User.objects.create_user(
            username="quiz-other-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        other_course = Course.objects.create(
            teacher=other_teacher,
            title="Hidden Course",
            description="Hidden.",
            subject="Math",
            grade_level="10",
            status="active",
        )
        attempt = self.create_attempt(course=other_course)
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(
            reverse("quiz-attempt-detail", kwargs={"attempt_pk": attempt.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
