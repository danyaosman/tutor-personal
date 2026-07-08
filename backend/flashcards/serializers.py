from rest_framework import serializers

from .models import Flashcard, FlashcardSet


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ["id", "front", "back"]


class FlashcardSetListSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    card_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = FlashcardSet
        fields = ["id", "course_id", "course_title", "title", "card_count", "created_at"]


class FlashcardSetDetailSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    cards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = FlashcardSet
        fields = ["id", "course_id", "course_title", "title", "cards", "created_at"]


class FlashcardGenerateSerializer(serializers.Serializer):
    card_count = serializers.IntegerField(min_value=1, max_value=30, required=False, default=10)
