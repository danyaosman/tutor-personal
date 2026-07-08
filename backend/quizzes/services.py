import json
import logging
import re

from django.conf import settings
import requests

from ai_tutor.models import ResourceChunk
from .models import Quiz, QuizQuestion

DEFAULT_QUESTION_COUNT = 5
MAX_CONTEXT_CHARS = 5000
logger = logging.getLogger(__name__)


def get_course_chunks(course, limit=8):
    return list(
        ResourceChunk.objects.filter(
            resource__course=course,
            resource__processing_status="completed",
        )
        .select_related("resource")
        .order_by("resource_id", "chunk_index")[:limit]
    )


def sentence_from_text(text):
    normalized = " ".join(text.split())
    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    for sentence in sentences:
        if len(sentence) >= 40:
            return sentence[:260]
    return normalized[:260]


def fallback_questions(chunks, count=DEFAULT_QUESTION_COUNT):
    if not chunks:
        raise ValueError("No processed course resources are available yet.")

    questions = []
    for index in range(count):
        chunk = chunks[index % len(chunks)]
        source_sentence = sentence_from_text(chunk.content)
        page = f"page {chunk.page_number}" if chunk.page_number else "the course material"
        questions.append(
            {
                "question_text": (
                    f"Which statement is best supported by {chunk.resource.file_name}, {page}?"
                ),
                "options": [
                    {"key": "A", "text": source_sentence},
                    {"key": "B", "text": "The resource says this topic is unrelated to the course."},
                    {"key": "C", "text": "The resource says students should skip this topic."},
                    {"key": "D", "text": "The resource gives no useful information about this topic."},
                ],
                "correct_option": "A",
                "explanation": f"This answer comes from {chunk.resource.file_name}, {page}.",
            }
        )
    return questions


def build_context(chunks):
    blocks = []
    for index, chunk in enumerate(chunks, start=1):
        page = f"page {chunk.page_number}" if chunk.page_number else "unknown page"
        blocks.append(
            "\n".join(
                [
                    f"Source {index}: {chunk.resource.file_name}, {page}",
                    chunk.content[:900],
                ]
            )
        )
    return "\n\n".join(blocks)[:MAX_CONTEXT_CHARS]


def parse_ai_questions(payload):
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload["questions"]
    raise ValueError("AI response did not include a questions list.")


def extract_json_payload(response_payload):
    choices = response_payload.get("choices")
    if choices:
        content = choices[0].get("message", {}).get("content", "")
    else:
        content = response_payload.get("output_text", "")

    if not isinstance(content, str) or not content.strip():
        raise ValueError("AI response did not include text content.")

    match = re.search(r"\{.*\}", content, flags=re.DOTALL)
    return json.loads(match.group(0) if match else content)


def generate_ai_questions(course, chunks, count):
    if not settings.AI_API_KEY:
        return fallback_questions(chunks, count)

    instructions = (
        "Generate a grounded multiple choice quiz from the course context only. "
        "Return strict JSON with a questions array. Each question must have "
        "question_text, options as four objects with key A/B/C/D and text, "
        "correct_option, and explanation."
    )
    prompt = (
        f"Course: {course.title}\n"
        f"Question count: {count}\n\n"
        f"Course context:\n{build_context(chunks)}"
    )

    response = requests.post(
        f"{settings.AI_BASE_URL}/chat/completions",
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
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        },
        timeout=settings.AI_REQUEST_TIMEOUT,
    )
    if not response.ok:
        logger.warning("Quiz generation failed with status %s.", response.status_code)
        response.raise_for_status()
    return parse_ai_questions(extract_json_payload(response.json()))


def normalize_questions(raw_questions, chunks, count):
    fallback = fallback_questions(chunks, count)
    normalized = []
    for index in range(count):
        raw_question = raw_questions[index] if index < len(raw_questions) else fallback[index]
        options = raw_question.get("options") or fallback[index]["options"]
        if isinstance(options, dict):
            options = [{"key": key, "text": value} for key, value in options.items()]
        clean_options = []
        for option in options[:4]:
            clean_options.append(
                {
                    "key": str(option.get("key", "")).strip().upper()[:1],
                    "text": str(option.get("text", "")).strip(),
                }
            )
        if len(clean_options) < 4 or any(not option["key"] or not option["text"] for option in clean_options):
            clean_options = fallback[index]["options"]
        normalized.append(
            {
                "question_text": str(
                    raw_question.get("question_text") or fallback[index]["question_text"]
                ).strip(),
                "options": clean_options,
                "correct_option": str(
                    raw_question.get("correct_option") or fallback[index]["correct_option"]
                )
                .strip()
                .upper()[:1],
                "explanation": str(
                    raw_question.get("explanation") or fallback[index]["explanation"]
                ).strip(),
            }
        )
    return normalized


def generate_quiz_for_course(course, count=DEFAULT_QUESTION_COUNT, difficulty="medium"):
    chunks = get_course_chunks(course)
    if not chunks:
        raise ValueError("No processed course resources are available yet.")

    try:
        raw_questions = generate_ai_questions(course, chunks, count)
    except (requests.RequestException, ValueError, json.JSONDecodeError) as exc:
        logger.warning("Using fallback quiz generation: %s", exc)
        raw_questions = fallback_questions(chunks, count)

    questions = normalize_questions(raw_questions, chunks, count)
    quiz = Quiz.objects.create(
        course=course,
        title=f"{course.title} Practice Quiz",
        difficulty_level=difficulty,
    )
    QuizQuestion.objects.bulk_create(
        [
            QuizQuestion(
                quiz=quiz,
                question_text=question["question_text"],
                options=question["options"],
                correct_option=question["correct_option"],
                explanation=question["explanation"],
            )
            for question in questions
        ]
    )
    return quiz
