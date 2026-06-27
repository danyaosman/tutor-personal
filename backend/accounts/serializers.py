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


class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    grade_level = serializers.CharField(required=False, allow_blank=True)
    weakness_summary = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    teaching_style_summary = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ai_instructions = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, user):
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "gender": user.gender,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at,
        }

        if user.role == User.STUDENT:
            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults={"grade_level": "Not specified"},
            )
            data.update(
                {
                    "grade_level": profile.grade_level,
                    "weakness_summary": profile.weakness_summary,
                    "updated_at": profile.updated_at,
                }
            )

        if user.role == User.TEACHER:
            profile, _ = TeacherProfile.objects.get_or_create(user=user)
            data.update(
                {
                    "bio": profile.bio,
                    "teaching_style_summary": profile.teaching_style_summary,
                    "ai_instructions": profile.ai_instructions,
                    "updated_at": profile.updated_at,
                }
            )

        return data

    def update(self, user, validated_data):
        for field in ["email", "first_name", "last_name", "gender", "phone"]:
            if field in validated_data:
                setattr(user, field, validated_data[field])
        user.save(update_fields=["email", "first_name", "last_name", "gender", "phone"])

        if user.role == User.STUDENT:
            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults={"grade_level": "Not specified"},
            )
            if "grade_level" in validated_data:
                profile.grade_level = validated_data["grade_level"] or "Not specified"
                profile.save(update_fields=["grade_level", "updated_at"])

        if user.role == User.TEACHER:
            profile, _ = TeacherProfile.objects.get_or_create(user=user)
            update_fields = []
            for field in ["bio", "teaching_style_summary", "ai_instructions"]:
                if field in validated_data:
                    setattr(profile, field, validated_data[field])
                    update_fields.append(field)
            if update_fields:
                profile.save(update_fields=update_fields + ["updated_at"])

        return user
