from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ai_tutor.models import ResourceChunk
from courses.models import Classroom, ClassroomEnrollment, Course, CourseResource
from .models import Flashcard, FlashcardSet

User = get_user_model()


@override_settings(AI_API_KEY="")
class FlashcardAPITests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username="flashcard-tutor",
            password="StrongPassword123!",
            role=User.TEACHER,
        )
        self.student = User.objects.create_user(
            username="flashcard-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.other_student = User.objects.create_user(
            username="flashcard-other-student",
            password="StrongPassword123!",
            role=User.STUDENT,
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            title="Biology Basics",
            description="Learn biology.",
            subject="Science",
            grade_level="10",
            status="active",
        )
        self.resource = CourseResource.objects.create(
            course=self.course,
            file_name="biology-notes.pdf",
            file="course_resources/biology-notes.pdf",
            file_size=1234,
            processing_status="completed",
        )
        ResourceChunk.objects.create(
            resource=self.resource,
            chunk_index=0,
            page_number=1,
            content="Cells are the basic unit of life and contain structures that perform specialized functions.",
        )
        ResourceChunk.objects.create(
            resource=self.resource,
            chunk_index=1,
            page_number=2,
            content="Photosynthesis lets plants convert light energy into chemical energy stored as glucose.",
        )
        self.classroom = Classroom.objects.create(course=self.course, name="Default Class")
        ClassroomEnrollment.objects.create(student=self.student, classroom=self.classroom)

    def test_student_generates_flashcards_from_enrolled_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("generate-course-flashcards", kwargs={"course_pk": self.course.id}),
            {"card_count": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["cards"]), 4)
        self.assertEqual(FlashcardSet.objects.count(), 1)
        self.assertEqual(Flashcard.objects.count(), 4)

    def test_student_cannot_generate_flashcards_before_enrollment(self):
        self.client.force_authenticate(user=self.other_student)

        response = self.client.post(
            reverse("generate-course-flashcards", kwargs={"course_pk": self.course.id}),
            {"card_count": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_flashcard_generation_requires_processed_resources(self):
        self.resource.processing_status = "failed"
        self.resource.save(update_fields=["processing_status"])
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("generate-course-flashcards", kwargs={"course_pk": self.course.id}),
            {"card_count": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("processed course resources", response.data["detail"])

    def test_student_lists_and_views_only_their_flashcard_sets(self):
        own_set = FlashcardSet.objects.create(
            course=self.course,
            student=self.student,
            title="Biology Flashcards",
        )
        Flashcard.objects.create(
            set=own_set,
            front="What are cells?",
            back="The basic unit of life.",
        )
        other_set = FlashcardSet.objects.create(
            course=self.course,
            student=self.other_student,
            title="Hidden Flashcards",
        )
        Flashcard.objects.create(
            set=other_set,
            front="Hidden",
            back="Hidden",
        )
        unenrolled_course = Course.objects.create(
            teacher=self.teacher,
            title="Chemistry Basics",
            description="Learn chemistry.",
            subject="Science",
            grade_level="10",
            status="active",
        )
        unenrolled_set = FlashcardSet.objects.create(
            course=unenrolled_course,
            student=self.student,
            title="Stale Chemistry Flashcards",
        )
        Flashcard.objects.create(
            set=unenrolled_set,
            front="Atom",
            back="Matter unit.",
        )
        self.client.force_authenticate(user=self.student)

        list_response = self.client.get(reverse("learner-flashcard-set-list"))
        detail_response = self.client.get(
            reverse("learner-flashcard-set-detail", kwargs={"set_pk": own_set.id})
        )
        hidden_response = self.client.get(
            reverse("learner-flashcard-set-detail", kwargs={"set_pk": other_set.id})
        )
        unenrolled_response = self.client.get(
            reverse("learner-flashcard-set-detail", kwargs={"set_pk": unenrolled_set.id})
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["id"], own_set.id)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["cards"][0]["front"], "What are cells?")
        self.assertEqual(hidden_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(unenrolled_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tutor_cannot_use_learner_flashcard_generation(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            reverse("generate-course-flashcards", kwargs={"course_pk": self.course.id}),
            {"card_count": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
