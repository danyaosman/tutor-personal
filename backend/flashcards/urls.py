from django.urls import path

from .views import (
    GenerateFlashcardSetView,
    LearnerFlashcardSetDetailView,
    LearnerFlashcardSetListView,
)

urlpatterns = [
    path("", LearnerFlashcardSetListView.as_view(), name="learner-flashcard-set-list"),
    path(
        "courses/<int:course_pk>/generate/",
        GenerateFlashcardSetView.as_view(),
        name="generate-course-flashcards",
    ),
    path(
        "<int:set_pk>/",
        LearnerFlashcardSetDetailView.as_view(),
        name="learner-flashcard-set-detail",
    ),
]
