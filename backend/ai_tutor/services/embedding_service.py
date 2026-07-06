from sentence_transformers import SentenceTransformer


class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("Loading BGE-M3 embedding model...")
            cls._model = SentenceTransformer("BAAI/bge-m3")
            print("Embedding model loaded.")
        return cls._model

    @staticmethod
    def embed_text(text: str) -> list[float]:
        if not text.strip():
            return []

        model = EmbeddingService.get_model()
        return model.encode(text).tolist()

    @staticmethod
    def embed_chunks(chunks: list[str]) -> list[list[float]]:
        if not chunks:
            return []

        model = EmbeddingService.get_model()
        return model.encode(chunks).tolist()

    @staticmethod
    def embed_query(question: str) -> list[float]:
        return EmbeddingService.embed_text(question)