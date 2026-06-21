from django.contrib import admin
from .models import ResourceChunk,ChatMessage,ChatSession

admin.site.register(ResourceChunk)
admin.site.register(ChatSession)
admin.site.register(ChatMessage)