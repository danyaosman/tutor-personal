from rest_framework import serializers


class CourseChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)


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
