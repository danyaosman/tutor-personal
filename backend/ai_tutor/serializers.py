from rest_framework import serializers


class CourseChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)
    session_id = serializers.IntegerField(required=False)


class CourseChatSourceSerializer(serializers.Serializer):
    resource_id = serializers.IntegerField()
    file_name = serializers.CharField()
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
    source_references = serializers.JSONField()
    created_at = serializers.DateTimeField()


class ChatSessionListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    last_message = serializers.SerializerMethodField()

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
    created_at = serializers.DateTimeField()
    messages = ChatMessageSerializer(many=True)