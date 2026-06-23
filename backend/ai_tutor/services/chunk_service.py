from ai_tutor.models import ResourceChunk

from .pdf_service import extract_pdf_pages

MAX_CHUNK_CHARS = 1200
CHUNK_OVERLAP_CHARS = 150


def split_text_into_chunks(text, max_chars=MAX_CHUNK_CHARS, overlap_chars=CHUNK_OVERLAP_CHARS):
    if len(text) <= max_chars:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        if end < len(text):
            boundary = text.rfind(" ", start, end)
            if boundary > start + max_chars // 2:
                end = boundary

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break
        start = max(end - overlap_chars, 0)

    return chunks


def save_resource_chunks(resource, page_texts):
    ResourceChunk.objects.filter(resource=resource).delete()

    chunks = []
    chunk_index = 0
    for page_text in page_texts:
        for chunk_text in split_text_into_chunks(page_text.content):
            chunks.append(
                ResourceChunk(
                    resource=resource,
                    chunk_index=chunk_index,
                    content=chunk_text,
                    page_number=page_text.page_number,
                )
            )
            chunk_index += 1

    ResourceChunk.objects.bulk_create(chunks)
    return len(chunks)


def process_course_resource(resource):
    resource.processing_status = "processing"
    resource.save(update_fields=["processing_status"])

    try:
        page_texts = extract_pdf_pages(resource.file.path)
        chunk_count = save_resource_chunks(resource, page_texts)
    except Exception:
        resource.processing_status = "failed"
        resource.save(update_fields=["processing_status"])
        return 0

    resource.processing_status = "completed"
    resource.save(update_fields=["processing_status"])
    return chunk_count
