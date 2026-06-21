from django.db import models
from courses.models import Course
from accounts.models import User

class Quiz(models.Model):

    LEVELS = [
        ("easy","Easy"),
        ("medium","Medium"),
        ("hard","Hard"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    title = models.CharField(max_length=255)

    difficulty_level = models.CharField(
        max_length=20,
        choices=LEVELS
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class QuizQuestion(models.Model):

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_text = models.TextField()

    options = models.JSONField()

    correct_option = models.CharField(
        max_length=10
    )

    explanation = models.TextField(
        blank=True
    )

class QuizAttempt(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE
    )

    score = models.IntegerField()

    attempted_at = models.DateTimeField(
        auto_now_add=True
    )


class QuizAnswer(models.Model):

    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name="answers"
    )

    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE
    )

    selected_option = models.CharField(
        max_length=10
    )

    is_correct = models.BooleanField()