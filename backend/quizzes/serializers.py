from rest_framework import serializers

from .models import Quiz, QuizAnswer, QuizAttempt, QuizQuestion


class QuizQuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "options"]


class QuizQuestionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "options", "correct_option", "explanation"]


class QuizListSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    attempt_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "course_id",
            "course_title",
            "title",
            "difficulty_level",
            "question_count",
            "attempt_count",
            "best_score",
            "created_at",
        ]

    def get_attempts(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return QuizAttempt.objects.none()
        return QuizAttempt.objects.filter(quiz=obj, student=request.user)

    def get_attempt_count(self, obj):
        return self.get_attempts(obj).count()

    def get_best_score(self, obj):
        attempts = self.get_attempts(obj)
        if not attempts.exists():
            return None
        return max(attempt.score for attempt in attempts)


class QuizDetailSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    questions = QuizQuestionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "course_id",
            "course_title",
            "title",
            "difficulty_level",
            "questions",
            "created_at",
        ]


class QuizGenerateSerializer(serializers.Serializer):
    question_count = serializers.IntegerField(min_value=1, max_value=20, required=False, default=5)
    difficulty_level = serializers.ChoiceField(
        choices=["easy", "medium", "hard"],
        required=False,
        default="medium",
    )


class SubmittedAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.CharField(max_length=10)


class QuizSubmitSerializer(serializers.Serializer):
    answers = SubmittedAnswerSerializer(many=True)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("Submit at least one answer.")
        return value


class QuizAnswerResultSerializer(serializers.ModelSerializer):
    question = QuizQuestionResultSerializer(read_only=True)

    class Meta:
        model = QuizAnswer
        fields = ["question", "selected_option", "is_correct"]


class QuizAttemptResultSerializer(serializers.ModelSerializer):
    quiz_id = serializers.IntegerField(read_only=True)
    answers = QuizAnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz_id", "score", "attempted_at", "answers"]
