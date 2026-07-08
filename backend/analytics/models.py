from django.db import models
from accounts.models import User
from courses.models import Course

class WeaknessReport(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    weakness_summary = models.TextField()

    weak_topics = models.JSONField()

    generated_at = models.DateTimeField(
        auto_now_add=True
    )

class TeachingStyleExample(models.Model):

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    example_text = models.TextField()

    source_file_url = models.URLField()