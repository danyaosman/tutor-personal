from rest_framework import serializers

from .models import TeachingStyleExample, WeaknessReport


class WeaknessReportSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)
    student_name = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = WeaknessReport
        fields = [
            "id",
            "student_id",
            "student_username",
            "student_name",
            "course_id",
            "course_title",
            "weakness_summary",
            "weak_topics",
            "generated_at",
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


class WeaknessReportGenerateSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(required=False)


class TeachingStyleExampleSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = TeachingStyleExample
        fields = [
            "id",
            "course_id",
            "course_title",
            "example_text",
            "source_file_url",
        ]
        read_only_fields = ["id", "course_id", "course_title"]
        extra_kwargs = {
            "source_file_url": {"required": False, "allow_blank": True},
        }

    def validate_example_text(self, value):
        normalized_value = value.strip()
        if not normalized_value:
            raise serializers.ValidationError("Example text cannot be empty.")
        return normalized_value
