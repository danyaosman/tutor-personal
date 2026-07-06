from django.db import models
from courses.models import CourseResource,Course
from accounts.models import User
from pgvector.django import VectorField


class ResourceChunk(models.Model):

    resource = models.ForeignKey(
        CourseResource,
        on_delete=models.CASCADE,
        related_name="chunks",
    )

    chunk_index = models.IntegerField()

    content = models.TextField()

    page_number = models.IntegerField(
        null=True,
        blank=True,
    )

    embedding = VectorField(
        dimensions=1024,
        null=True,
        blank=True,
    )

class ChatSession(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=80,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class ChatMessage(models.Model):

    SENDER_CHOICES = [
        ("student","Student"),
        ("ai","AI")
    ]

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.CharField(
        max_length=20,
        choices=SENDER_CHOICES
    )

    message_text = models.TextField()

    source_references = models.JSONField(
        default=list
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
