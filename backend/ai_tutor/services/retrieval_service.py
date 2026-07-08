from pgvector.django import CosineDistance

from ai_tutor.models import ResourceChunk
from .embedding_service import EmbeddingService
from .rerank_service import ReRankService
from .query_analyzer import QueryAnalyzer


class RetrievalService:
    """
    Performs the first-stage semantic retrieval using pgvector.

    pgvector retrieves a larger candidate pool.

    The candidates are then passed to the ReRankService,
    which performs a second ranking stage before the
    ContextBuilder assembles the final prompt.
    """

    DEFAULT_LIMIT = 4

    # retrieve more than we finally return
    CANDIDATE_LIMIT = 20

    @classmethod
    def retrieve_chunks(
        cls,
        course,
        question,
        limit=None,
    ):
        if limit is None:
            limit = cls.DEFAULT_LIMIT

        query_embedding = EmbeddingService.embed_query(question)

        candidates = cls.retrieve_candidates(
            course,
            query_embedding,
        )

        intent = QueryAnalyzer.analyze(question)

        ranked = ReRankService.rerank(
            question=question,
            chunks=candidates,
            intent=intent,
        )

        return ranked[:limit]

    @classmethod
    def retrieve_candidates(
        cls,
        course,
        query_embedding,
    ):
        """
        First-stage retrieval.

        Uses pgvector cosine similarity to retrieve the
        most semantically similar chunks.
        """

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