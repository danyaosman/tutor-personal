import logging
import re

from django.conf import settings
import requests

from ai_tutor.models import ResourceChunk

MAX_SOURCES = 4
MAX_SNIPPET_CHARS = 700
logger = logging.getLogger(__name__)


def tokenize(text):
    return {
        token.lower()
        for token in re.findall(r"\w+", text, flags=re.UNICODE)
        if len(token) > 2
    }


def score_chunk(chunk, question_tokens):
    content = chunk.content.lower()
    return sum(content.count(token) for token in question_tokens)


def find_relevant_chunks(course, question, limit=MAX_SOURCES):
    chunks = (
        ResourceChunk.objects.filter(
            resource__course=course,
            resource__processing_status="completed",
        )
        .select_related("resource")
        .order_by("resource_id", "chunk_index")
    )
    question_tokens = tokenize(question)

    if not question_tokens:
        return list(chunks[:limit])

    scored_chunks = [
        (score_chunk(chunk, question_tokens), chunk)
        for chunk in chunks
    ]
    matching_chunks = [
        chunk
        for score, chunk in sorted(scored_chunks, key=lambda item: item[0], reverse=True)
        if score > 0
    ]

    if matching_chunks:
        return matching_chunks[:limit]

    return list(chunks[:limit])


def build_source_reference(chunk):
    return {
        "resource_id": chunk.resource_id,
        "file_name": chunk.resource.file_name,
        "page_number": chunk.page_number,
        "chunk_index": chunk.chunk_index,
        "preview": chunk.content[:MAX_SNIPPET_CHARS],
    }


def build_grounded_answer(question, chunks):
    if not chunks:
        return (
            "I could not find processed course resources yet. "
            "Ask the tutor to upload a readable PDF, then try again."
        )

    source_lines = []
    for index, chunk in enumerate(chunks, start=1):
        page = f"page {chunk.page_number}" if chunk.page_number else "unknown page"
        snippet = chunk.content[:MAX_SNIPPET_CHARS]
        source_lines.append(
            f"{index}. From {chunk.resource.file_name}, {page}: {snippet}"
        )

    return (
        "Based on the course resources, here is the most relevant information I found:\n\n"
        + "\n\n".join(source_lines)
        + "\n\nUse these notes to answer the question: "
        + question
    )


def build_context(chunks):
    context_blocks = []
    for index, chunk in enumerate(chunks, start=1):
        page = f"page {chunk.page_number}" if chunk.page_number else "unknown page"
        context_blocks.append(
            "\n".join(
                [
                    f"Source {index}",
                    f"File: {chunk.resource.file_name}",
                    f"Page: {page}",
                    f"Content: {chunk.content[:MAX_SNIPPET_CHARS]}",
                ]
            )
        )
    return "\n\n".join(context_blocks)


def extract_response_text(response_payload):
    choices = response_payload.get("choices")
    if choices:
        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, str):
            return content.strip()

    if isinstance(response_payload.get("output_text"), str):
        return response_payload["output_text"].strip()

    text_parts = []
    for output_item in response_payload.get("output", []):
        for content_item in output_item.get("content", []):
            text = content_item.get("text")
            if text:
                text_parts.append(text)
    return "\n".join(text_parts).strip()


def build_chat_url():
    return f"{settings.AI_BASE_URL}/chat/completions"


def generate_ai_answer(question, chunks):
    if not chunks:
        return build_grounded_answer(question, chunks)

    if not settings.AI_API_KEY:
        logger.info("AI API key is not configured; using grounded fallback answer.")
        return build_grounded_answer(question, chunks)

    logger.info(
        "Calling %s chat completions API with model %s.",
        settings.AI_PROVIDER,
        settings.AI_MODEL,
    )

    instructions = (
        "You are EduMind's AI tutor. Answer the learner using only the provided "
        "course context. If the context is not enough, say what is missing. "
        "Be clear, supportive, and concise. Mention source file/page references "
        "when useful. Do not invent facts outside the course context."
    )
    user_prompt = (
        "Course context:\n"
        f"{build_context(chunks)}\n\n"
        "Learner question:\n"
        f"{question}"
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
                {"role": "system", "content": instructions},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
        },
        timeout=settings.AI_REQUEST_TIMEOUT,
    )
    if not response.ok:
        logger.warning(
            "%s API request failed with status %s: %s",
            settings.AI_PROVIDER,
            response.status_code,
            response.text[:500],
        )
        response.raise_for_status()

    answer = extract_response_text(response.json())
    if not answer:
        logger.warning("%s API response did not include answer text.", settings.AI_PROVIDER)
    return answer or build_grounded_answer(question, chunks)


def answer_course_question(course, question):
    chunks = find_relevant_chunks(course, question)
    try:
        answer = generate_ai_answer(question, chunks)
    except (requests.RequestException, ValueError) as exc:
        logger.warning("AI answer generation failed: %s", exc)
        answer = build_grounded_answer(question, chunks)
    sources = [build_source_reference(chunk) for chunk in chunks]
    return answer, sources
