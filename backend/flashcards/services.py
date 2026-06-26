import json
import logging
import re

from django.conf import settings
import requests

from ai_tutor.models import ResourceChunk
from .models import Flashcard, FlashcardSet

DEFAULT_CARD_COUNT = 10
MAX_CONTEXT_CHARS = 5000
logger = logging.getLogger(__name__)


def get_course_chunks(course, limit=10):
    return list(
        ResourceChunk.objects.filter(
            resource__course=course,
            resource__processing_status="completed",
        )
        .select_related("resource")
        .order_by("resource_id", "chunk_index")[:limit]
    )


def compact_sentence(text):
    normalized = " ".join(text.split())
    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    for sentence in sentences:
        if len(sentence) >= 35:
            return sentence[:320]
    return normalized[:320]


def fallback_cards(chunks, count=DEFAULT_CARD_COUNT):
    if not chunks:
        raise ValueError("No processed course resources are available yet.")

    cards = []
    for index in range(count):
        chunk = chunks[index % len(chunks)]
        page = f"page {chunk.page_number}" if chunk.page_number else "the course material"
        cards.append(
            {
                "front": f"What is a key idea from {chunk.resource.file_name}, {page}?",
                "back": compact_sentence(chunk.content),
            }
        )
    return cards


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


def parse_ai_cards(payload):
    if isinstance(payload, dict) and isinstance(payload.get("cards"), list):
        return payload["cards"]
    raise ValueError("AI response did not include a cards list.")


def generate_ai_cards(course, chunks, count):
    if not settings.AI_API_KEY:
        return fallback_cards(chunks, count)

    instructions = (
        "Generate study flashcards from the course context only. Return strict JSON "
        "with a cards array. Each card must have front and back strings. Keep cards concise."
    )
    prompt = (
        f"Course: {course.title}\n"
        f"Card count: {count}\n\n"
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
        logger.warning("Flashcard generation failed with status %s.", response.status_code)
        response.raise_for_status()
    return parse_ai_cards(extract_json_payload(response.json()))


def normalize_cards(raw_cards, chunks, count):
    fallback = fallback_cards(chunks, count)
    normalized = []
    for index in range(count):
        raw_card = raw_cards[index] if index < len(raw_cards) else fallback[index]
        front = str(raw_card.get("front") or fallback[index]["front"]).strip()
        back = str(raw_card.get("back") or fallback[index]["back"]).strip()
        normalized.append({"front": front, "back": back})
    return normalized


def generate_flashcard_set_for_course(student, course, count=DEFAULT_CARD_COUNT):
    chunks = get_course_chunks(course)
    if not chunks:
        raise ValueError("No processed course resources are available yet.")

    try:
        raw_cards = generate_ai_cards(course, chunks, count)
    except (requests.RequestException, ValueError, json.JSONDecodeError) as exc:
        logger.warning("Using fallback flashcard generation: %s", exc)
        raw_cards = fallback_cards(chunks, count)

    cards = normalize_cards(raw_cards, chunks, count)
    card_set = FlashcardSet.objects.create(
        course=course,
        student=student,
        title=f"{course.title} Flashcards",
    )
    Flashcard.objects.bulk_create(
        [
            Flashcard(
                set=card_set,
                front=card["front"],
                back=card["back"],
            )
            for card in cards
        ]
    )
    return card_set
