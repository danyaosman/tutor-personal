import logging

import requests
from django.conf import settings

from analytics.models import TeachingStyleExample
from ai_tutor.models import ResourceChunk

from .context_builder import ContextBuilder
from .retrieval_service import RetrievalService


MAX_SNIPPET_CHARS = 700

logger = logging.getLogger(__name__)


def build_source_reference(chunk):
    return {
        "resource_id": chunk.resource_id,
        "file_name": chunk.resource.file_name,
        "page_number": chunk.page_number,
        "chunk_index": chunk.chunk_index,
        "preview": chunk.content[:MAX_SNIPPET_CHARS],
    }


def collect_teacher_guidance(course):
    teacher_profile = getattr(course.teacher, "teacher_profile", None)

    guidance_parts = []

    if teacher_profile:

        if teacher_profile.teaching_style_summary:
            guidance_parts.append(
                f"Teaching style: {teacher_profile.teaching_style_summary.strip()}"
            )

        if teacher_profile.ai_instructions:
            guidance_parts.append(
                f"AI instructions: {teacher_profile.ai_instructions.strip()}"
            )

    examples = (
        TeachingStyleExample.objects.filter(
            teacher=course.teacher,
            course=course,
        )
        .order_by("-id")[:3]
    )

    for index, example in enumerate(examples, start=1):
        guidance_parts.append(
            f"Style example {index}: "
            f"{example.example_text[:700].strip()}"
        )

    style_chunks = (
        ResourceChunk.objects.filter(
            resource__course=course,
            resource__is_style_example=True,
            resource__processing_status="completed",
        )
        .select_related("resource")
        .order_by(
            "resource__file_name",
            "chunk_index",
        )[:5]
    )

    style_chunk_lines = [
        f"{index}. From {chunk.resource.file_name}: "
        f"{chunk.content[:700].strip()}"
        for index, chunk in enumerate(style_chunks, start=1)
        if chunk.content.strip()
    ]

    if style_chunk_lines:
        guidance_parts.append(
            "Style reference excerpts from uploaded files:\n"
            + "\n".join(style_chunk_lines)
        )

    return "\n".join(guidance_parts)


def build_grounded_answer(
    question,
    chunks,
    teacher_guidance="",
):
    if not chunks:
        return (
            "I could not find processed course resources yet. "
            "Ask the tutor to upload a readable PDF, then try again."
        )

    source_lines = []

    for index, chunk in enumerate(chunks, start=1):

        page = (
            f"page {chunk.page_number}"
            if chunk.page_number
            else "unknown page"
        )

        source_lines.append(
            f"{index}. "
            f"From {chunk.resource.file_name}, {page}: "
            f"{chunk.content[:MAX_SNIPPET_CHARS]}"
        )

    guidance = ""

    if teacher_guidance:
        guidance = (
            "\n\nTutor guidance:\n"
            f"{teacher_guidance}"
        )

    return (
        "Based on the course resources, here is the most relevant information I found:\n\n"
        + "\n\n".join(source_lines)
        + guidance
        + "\n\nUse these notes to answer the following question:\n"
        + question
    )


def extract_response_text(response_payload):
    choices = response_payload.get("choices")

    if choices:
        message = choices[0].get("message", {})
        content = message.get("content")

        if isinstance(content, str):
            return content.strip()

    output_text = response_payload.get("output_text")

    if isinstance(output_text, str):
        return output_text.strip()

    text_parts = []

    for output_item in response_payload.get("output", []):

        for content_item in output_item.get("content", []):

            text = content_item.get("text")

            if text:
                text_parts.append(text)

    return "\n".join(text_parts).strip()


def build_chat_url():
    return f"{settings.AI_BASE_URL}/chat/completions"


def generate_ai_answer(
    course,
    question,
    context,
    teacher_guidance,
):
    if not context:
        return ""

    if not settings.AI_API_KEY:
        logger.info(
            "AI API key is not configured."
        )
        return ""

    logger.info(
        "Calling %s chat completions API using model %s.",
        settings.AI_PROVIDER,
        settings.AI_MODEL,
    )

    instructions = (
        "You are EduMind's AI tutor.\n\n"
        "Use ONLY the supplied course context to answer the student's question.\n"
        "If the context is insufficient, clearly state that the course materials "
        "do not contain enough information.\n"
        "Never invent facts.\n"
        "If several sources discuss the same topic, combine them into one coherent explanation.\n"
        "Answer in the same language as the student's question whenever possible."
    )

    if teacher_guidance:
        instructions += (
            "\n\nFollow this tutor-specific teaching style:\n"
            f"{teacher_guidance}"
        )

    user_prompt = (
        f"Course context:\n{context}\n\n"
        f"Student question:\n{question}"
    )

    response = requests.post(
        build_chat_url(),
        headers={
            "Authorization": f"Bearer {settings.AI_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.AI_SITE_URL,
            "X-OpenRouter-Title": settings.AI_APP_NAME,
        },
        json={
            "model": settings.AI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": instructions,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "temperature": 0.2,
        },
        timeout=settings.AI_REQUEST_TIMEOUT,
    )

    if not response.ok:
        logger.warning(
            "%s request failed (%s): %s",
            settings.AI_PROVIDER,
            response.status_code,
            response.text[:500],
        )
        response.raise_for_status()

    answer = extract_response_text(response.json())

    if not answer:
        logger.warning("AI returned an empty response.")
        return ""

    return answer


def answer_course_question(course, question):

    teacher_guidance = collect_teacher_guidance(course)

    retrieved_chunks = RetrievalService.retrieve_chunks(
        course,
        question,
    )

    context = ContextBuilder.build_context(
        retrieved_chunks,
    )

    try:

        answer = generate_ai_answer(
            course=course,
            question=question,
            context=context,
            teacher_guidance=teacher_guidance,
        )

        if not answer:
            answer = build_grounded_answer(
                question,
                retrieved_chunks,
                teacher_guidance,
            )

    except (requests.RequestException, ValueError) as exc:

        logger.warning(
            "AI answer generation failed: %s",
            exc,
        )

        answer = build_grounded_answer(
            question,
            retrieved_chunks,
            teacher_guidance,
        )

    sources = [
        build_source_reference(chunk)
        for chunk in retrieved_chunks
    ]

    return answer, sources