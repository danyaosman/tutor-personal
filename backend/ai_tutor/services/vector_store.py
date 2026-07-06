from collections import defaultdict


class InMemoryVectorStore:
    """
    Temporary vector store.

    This will later be replaced by PostgreSQL + pgvector
    without changing RetrievalService.
    """

    _vectors = defaultdict(list)

    @classmethod
    def clear_resource(cls, resource_id):
        cls._vectors[resource_id] = []

    @classmethod
    def add_embedding(cls, resource_id, chunk_id, embedding):
        cls._vectors[resource_id].append(
            {
                "chunk_id": chunk_id,
                "embedding": embedding,
            }
        )

    @classmethod
    def get_course_embeddings(cls, course):
        vectors = []

        for resource in course.resources.all():
            vectors.extend(cls._vectors.get(resource.id, []))

        return vectors