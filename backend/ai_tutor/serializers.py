from rest_framework import serializers


class CourseChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)
    session_id = serializers.IntegerField(required=False)


class CourseChatSourceSerializer(serializers.Serializer):
    resource_id = serializers.IntegerField()
    page_number = serializers.IntegerField(allow_null=True)
    chunk_index = serializers.IntegerField()
    preview = serializers.CharField()


class CourseChatResponseSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    message = serializers.CharField()
    answer = serializers.CharField()
    sources = CourseChatSourceSerializer(many=True)


class ChatMessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    sender = serializers.CharField()
    message_text = serializers.CharField()
    source_references = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()

    def get_source_references(self, obj):
        return [
            {
                "resource_id": source.get("resource_id"),
                "page_number": source.get("page_number"),
                "chunk_index": source.get("chunk_index"),
                "preview": source.get("preview", ""),
            }
            for source in obj.source_references
        ]


class ChatSessionListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    last_message = serializers.SerializerMethodField()

    def get_title(self, obj):
        if obj.title:
            return obj.title
        first_question = obj.messages.filter(sender="student").order_by("created_at", "id").first()
        if not first_question:
            return "New chat"
        normalized_title = " ".join(first_question.message_text.split())
        if len(normalized_title) > 80:
            return f"{normalized_title[:77].rstrip()}..."
        return normalized_title

    def get_last_message(self, obj):
        last_message = obj.messages.order_by("-created_at").first()
        if not last_message:
            return None
        return {
            "sender": last_message.sender,
            "message_text": last_message.message_text,
            "created_at": last_message.created_at,
        }


class ChatSessionDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    messages = ChatMessageSerializer(many=True)

    def get_title(self, obj):
        if obj.title:
            return obj.title
        first_question = obj.messages.filter(sender="student").order_by("created_at", "id").first()
        if not first_question:
            return "New chat"
        normalized_title = " ".join(first_question.message_text.split())
        if len(normalized_title) > 80:
            return f"{normalized_title[:77].rstrip()}..."
        return normalized_title
