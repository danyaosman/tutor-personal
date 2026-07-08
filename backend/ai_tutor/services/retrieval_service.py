from pgvector.django import CosineDistance

from ai_tutor.models import ResourceChunk

from .embedding_service import EmbeddingService


class RetrievalService:
    

    DEFAULT_LIMIT = 4

    
    CANDIDATE_LIMIT = 20

    @classmethod
    def retrieve_chunks(
        cls,
        course,
        question: str,
        limit: int | None = None,
    ):
       

        if limit is None:
            limit = cls.DEFAULT_LIMIT

        query_embedding = EmbeddingService.embed_query(question)

        candidates = cls.retrieve_candidates(
            course,
            query_embedding,
        )

        return candidates[:limit]

    @classmethod
    def retrieve_candidates(
        cls,
        course,
        query_embedding,
    ):
        

        return list(
            ResourceChunk.objects.filter(
                resource__course=course,
                resource__processing_status="completed",
                resource__is_style_example=False,
                embedding__isnull=False,
            )
            .select_related("resource")
            .annotate(
                distance=CosineDistance(
                    "embedding",
                    query_embedding,
                )
            )
            .order_by("distance")[: cls.CANDIDATE_LIMIT]
        )