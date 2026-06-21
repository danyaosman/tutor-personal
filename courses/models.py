from django.db import models
from accounts.models import User

class Course(models.Model):

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="courses"
    )

    title = models.CharField(max_length=255)

    description = models.TextField()

    subject = models.CharField(max_length=100)

    grade_level = models.CharField(max_length=50)

    status = models.CharField(max_length=30)

    created_at = models.DateTimeField(
        auto_now_add=True
    )


class Classroom(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="classrooms"
    )

    name = models.CharField(max_length=255)

    description = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class ClassroomEnrollment(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="classroom_enrollments"
    )

    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    enrolled_at = models.DateTimeField(
        auto_now_add=True
    )


class CourseResource(models.Model):

    STATUS_CHOICES = [
        ("uploaded","Uploaded"),
        ("processing","Processing"),
        ("completed","Completed"),
        ("failed","Failed"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="resources"
    )

    file_name = models.CharField(max_length=255)

    file = models.FileField(
        upload_to="course_resources/"
    )

    file_size = models.IntegerField()

    is_style_example = models.BooleanField(
        default=False
    )

    processing_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="uploaded"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )



class Syllabus(models.Model):

    course = models.OneToOneField(
        Course,
        on_delete=models.CASCADE,
        related_name="syllabus"
    )

    generated_content = models.TextField()

    edited_content = models.TextField(
        blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )