from rest_framework import serializers

from .models import Course, CourseResource


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(read_only=True, default=0)
    resource_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "subject",
            "grade_level",
            "status",
            "teacher_name",
            "student_count",
            "resource_count",
            "created_at",
        ]
        read_only_fields = ["id", "teacher_name", "created_at"]

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username

    def validate_status(self, value):
        allowed_statuses = {"draft", "active", "archived"}
        normalized_value = value.lower()
        if normalized_value not in allowed_statuses:
            raise serializers.ValidationError(
                "Status must be draft, active, or archived."
            )
        return normalized_value


class CourseResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = [
            "id",
            "file_name",
            "file",
            "file_size",
            "is_style_example",
            "processing_status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "file_name",
            "file_size",
            "processing_status",
            "created_at",
        ]

    def validate_file(self, value):
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are supported.")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("PDF files must be 10 MB or smaller.")
        return value
