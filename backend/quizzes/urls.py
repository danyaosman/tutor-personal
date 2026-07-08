from django.urls import path

from .views import (
    GenerateQuizView,
    LearnerQuizDetailView,
    LearnerQuizListView,
    QuizAttemptDetailView,
    SubmitQuizAttemptView,
)

urlpatterns = [
    path("", LearnerQuizListView.as_view(), name="learner-quiz-list"),
    path(
        "courses/<int:course_pk>/generate/",
        GenerateQuizView.as_view(),
        name="generate-course-quiz",
    ),
    path("<int:quiz_pk>/", LearnerQuizDetailView.as_view(), name="learner-quiz-detail"),
    path("attempts/<int:attempt_pk>/", QuizAttemptDetailView.as_view(), name="quiz-attempt-detail"),
    path(
        "<int:quiz_pk>/submit/",
        SubmitQuizAttemptView.as_view(),
        name="submit-quiz-attempt",
    ),
]
