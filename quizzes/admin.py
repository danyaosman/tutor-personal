from django.contrib import admin
from .models import Quiz,QuizQuestion,QuizAttempt,QuizAnswer

admin.site.register(Quiz)
admin.site.register(QuizQuestion)
admin.site.register(QuizAttempt)
admin.site.register(QuizAnswer)
