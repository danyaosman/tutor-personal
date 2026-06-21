from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, TeacherProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    grade_level = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "gender",
            "phone",
            "role",
            "grade_level",
            "bio",
        ]

    def validate_role(self, value):
        if value not in ["student", "teacher"]:
            raise serializers.ValidationError("Role must be student or teacher.")
        return value

    def create(self, validated_data):
        grade_level = validated_data.pop("grade_level", "")
        bio = validated_data.pop("bio", "")

        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == "student":
            StudentProfile.objects.create(
                user=user,
                grade_level=grade_level or "Not specified"
            )

        if user.role == "teacher":
            TeacherProfile.objects.create(
                user=user,
                bio=bio
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "gender",
            "phone",
            "role",
            "is_active",
            "created_at",
        ]