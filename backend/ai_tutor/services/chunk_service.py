import traceback
from ai_tutor.models import ResourceChunk

from llama_index.core.node_parser import SentenceSplitter
from .pdf_service import extract_pdf_pages
from .embedding_service import EmbeddingService
from .vector_store import InMemoryVectorStore


CHUNK_SIZE = 1024
CHUNK_OVERLAP = 150
splitter = SentenceSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)

def split_text_into_chunks(text):
    if not text:
        return []
    try:
        return splitter.split_text(text)
    except Exception:
        return[text]


def save_resource_chunks(resource, page_texts):
    ResourceChunk.objects.filter(resource=resource).delete()

    chunk_data = []
    chunk_index = 0

    for page_text in page_texts:
        for chunk_text in split_text_into_chunks(page_text.content):
            chunk_data.append(
                {
                    "chunk_index": chunk_index,
                    "content": chunk_text,
                    "page_number": page_text.page_number,
                }
            )
            chunk_index += 1

    if not chunk_data:
        return 0

    texts = [item["content"] for item in chunk_data]

    embeddings = EmbeddingService.embed_chunks(texts)

    chunks = []

    for item, embedding in zip(chunk_data, embeddings):
        chunks.append(
            ResourceChunk(
                resource=resource,
                chunk_index=item["chunk_index"],
                content=item["content"],
                page_number=item["page_number"],
                embedding=embedding,
            )
        )

    ResourceChunk.objects.bulk_create(chunks)

    created_chunks = ResourceChunk.objects.filter(
        resource=resource
    ).order_by("chunk_index")

    InMemoryVectorStore.clear_resource(resource.id)

    for chunk in created_chunks:
        InMemoryVectorStore.add_embedding(
            resource.id,
            chunk.id,
            chunk.embedding,
        )

    return len(created_chunks)


def process_course_resource(resource):
    resource.processing_status = "processing"
    resource.save(update_fields=["processing_status"])

    try:
        page_texts = extract_pdf_pages(resource.file.path)
        chunk_count = save_resource_chunks(resource, page_texts)
    except Exception:
        traceback.print_exc()
        resource.processing_status = "failed"
        resource.save(update_fields=["processing_status"])
        return 0

    resource.processing_status = "completed"
    resource.save(update_fields=["processing_status"])
    return chunk_count
