from django.db import models
from courses.models import Course
from accounts.models import User

class FlashcardSet(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class Flashcard(models.Model):

    set = models.ForeignKey(
        FlashcardSet,
        on_delete=models.CASCADE,
        related_name="cards"
    )

    front = models.TextField()

    back = models.TextField()