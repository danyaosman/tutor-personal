from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    STUDENT = "student"
    TEACHER = "teacher"

    ROLE_CHOICES = [
        (STUDENT, "Student"),
        (TEACHER, "Teacher"),
    ]

    gender = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Interest(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    interests = models.ManyToManyField(
        Interest,
        related_name='students',
        blank=True
        )

    grade_level = models.CharField(max_length=50)

    weakness_summary = models.TextField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(auto_now=True)

class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="teacher_profile"
    )

    bio = models.TextField(blank=True)

    teaching_style_summary = models.TextField(
        blank=True,
        null=True
    )

    ai_instructions = models.TextField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(auto_now=True)


