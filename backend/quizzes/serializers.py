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
    latest_attempt_id = serializers.SerializerMethodField()
    latest_attempt_at = serializers.SerializerMethodField()

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
            "latest_attempt_id",
            "latest_attempt_at",
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

    def get_latest_attempt(self, obj):
        return self.get_attempts(obj).order_by("-attempted_at", "-id").first()

    def get_latest_attempt_id(self, obj):
        latest_attempt = self.get_latest_attempt(obj)
        return latest_attempt.id if latest_attempt else None

    def get_latest_attempt_at(self, obj):
        latest_attempt = self.get_latest_attempt(obj)
        return latest_attempt.attempted_at if latest_attempt else None


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
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    course_id = serializers.IntegerField(source="quiz.course_id", read_only=True)
    course_title = serializers.CharField(source="quiz.course.title", read_only=True)
    student_id = serializers.IntegerField(read_only=True)
    student_name = serializers.SerializerMethodField()
    answers = QuizAnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz_id",
            "quiz_title",
            "course_id",
            "course_title",
            "student_id",
            "student_name",
            "score",
            "attempted_at",
            "answers",
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
