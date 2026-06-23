from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/", include("accounts.urls")),

    # Main apps
    path("api/courses/", include("courses.urls")),
    path("api/ai/", include("ai_tutor.urls")),
    path("api/quizzes/", include("quizzes.urls")),
    path("api/flashcards/", include("flashcards.urls")),
    path("api/analytics/", include("analytics.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
