import re

from sklearn.metrics.pairwise import cosine_similarity

import numpy as np

from .embedding_service import EmbeddingService
from .vector_store import InMemoryVectorStore

from ai_tutor.models import ResourceChunk


class RetrievalService:
   

    DEFAULT_LIMIT = 4

    @staticmethod
    def tokenize(text: str) -> set[str]:
        

        return {
            token.lower()
            for token in re.findall(r"\w+", text, flags=re.UNICODE)
            if len(token) > 2
        }

    @classmethod
    def score_chunk(cls, chunk, question_tokens: set[str]) -> int:
      

        content = chunk.content.lower()

        return sum(
            content.count(token)
            for token in question_tokens
        )

    @classmethod
    def get_course_chunks(cls, course):
      

        return (
            ResourceChunk.objects.filter(
                resource__course=course,
                resource__processing_status="completed",
                resource__is_style_example=False,
            )
            .select_related("resource")
            .order_by(
                "resource_id",
                "chunk_index",
            )
        )

    @classmethod
    def semantic_search(
        cls,
        course,
        question,
        limit,
    ):
        query_embedding = EmbeddingService.embed_query(question)

        vectors = InMemoryVectorStore.get_course_embeddings(course)

        if not vectors:
            return []

        scored = []

        for item in vectors:

            similarity = cls.cosine(
                query_embedding,
                item["embedding"],
            )

            scored.append(
                (
                    similarity,
                    item["chunk_id"],
                )
            )

        scored.sort(reverse=True)

        ids = [
            chunk_id
            for _, chunk_id in scored[:limit]
        ]

        chunk_lookup = {
            chunk.id: chunk
            for chunk in ResourceChunk.objects.filter(
                id__in=ids
            ).select_related("resource")
        }

        return [
            chunk_lookup[id]
            for id in ids
            if id in chunk_lookup
        ]

    @classmethod
    def retrieve_chunks(
        cls,
        course,
        question: str,
        limit: int | None = None,
    ):
        

        if limit is None:
            limit = cls.DEFAULT_LIMIT

        chunks = cls.get_course_chunks(course)

        question_tokens = cls.tokenize(question)

        return cls.semantic_search(
                course,
                question,
                limit,
            )
    

    @staticmethod
    def cosine(query_embedding, chunk_embedding):
        return cosine_similarity(
            [query_embedding],
            [chunk_embedding],
        )[0][0]