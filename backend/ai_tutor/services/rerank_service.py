import re


class ReRankService:
    """
    Second-stage ranking.

    pgvector finds semantically similar chunks.

    This service then improves the ordering using
    lightweight signals inspired by production
    Retrieval-Augmented Generation systems.

    Current signals:

    • semantic similarity (pgvector distance)
    • keyword overlap
    • exact phrase matches
    • short position bonus

    Future versions can add:

    • cross-encoder reranker
    • BM25
    • recency
    • teacher annotations
    """

    KEYWORD_WEIGHT = 0.30
    PHRASE_WEIGHT = 0.20
    POSITION_WEIGHT = 0.05
    INTENT_WEIGHT = 1.0

    @staticmethod
    def tokenize(text):
        return {
            token.lower()
            for token in re.findall(r"\w+", text, flags=re.UNICODE)
            if len(token) > 2
        }

    @classmethod
    def keyword_score(
        cls,
        question,
        chunk,
    ):
        query_tokens = cls.tokenize(question)
        chunk_tokens = cls.tokenize(chunk.content)

        if not query_tokens:
            return 0

        overlap = len(query_tokens & chunk_tokens)

        return overlap / len(query_tokens)

    @staticmethod
    def phrase_score(
        question,
        chunk,
    ):
        question = question.lower()

        if question in chunk.content.lower():
            return 1

        return 0

    @staticmethod
    def position_score(chunk):
        """
        Small preference toward earlier chunks.

        Introductory sections often define concepts.
        """

        return max(
            0,
            1 - (chunk.chunk_index / 100),
        )

    @classmethod
    def intent_bonus(
        cls,
        intent,
        chunk,
    ):
        text = chunk.content.lower()

        if intent == "definition":
            # Definitions are usually near the beginning.
            if chunk.chunk_index < 5:
                return 0.15

        elif intent == "example":
            if any(
                word in text
                for word in [
                    "example",
                    "examples",
                    "for instance",
                    "such as",
                    "مثال",
                    "أمثلة",
                    "على سبيل المثال",
                    "مثل",
                ]
            ):
                return 0.20

        elif intent == "comparison":
            if any(
                word in text
                for word in [
                    "whereas",
                    "however",
                    "while",
                    "compared",
                    "comparison",
                    "versus",
                    "vs",
                    "بينما",
                    "في المقابل",
                    "على عكس",
                    "مقارنة",
                    "مقارنةً",
                    "مقارنة مع",
                    "مقارنة بين",
                ]
            ):
                return 0.15

        elif intent == "summary":
            if chunk.chunk_index < 10:
                return 0.05

        elif intent == "list":
            if (
                ":" in text
                or "\n-" in text
                or "\n•" in text
                or "\n*" in text
                or "1." in text
                or "١." in text
            ):
                return 0.10

        elif intent == "reasoning":
            if any(
                word in text
                for word in [
                    "because",
                    "therefore",
                    "thus",
                    "since",
                    "as a result",
                    "because of",
                    "لأن",
                    "بسبب",
                    "لذلك",
                    "لهذا",
                    "نتيجة",
                    "بناءً على",
                ]
            ):
                return 0.15

        return 0

    @classmethod
    def rerank(
        cls,
        question,
        chunks,
        intent,
    ):
        scored = []
        for chunk in chunks:

            semantic_score = max(0,1 - float(chunk.distance))

            keyword_score = cls.keyword_score(
                question,
                chunk,
            )

            phrase_score = cls.phrase_score(
                question,
                chunk,
            )

            position_score = cls.position_score(
                chunk,
            )

            intent_score = cls.intent_bonus(
                    intent,
                    chunk,
                )
            final_score = (
                semantic_score
                + cls.KEYWORD_WEIGHT * keyword_score
                + cls.PHRASE_WEIGHT * phrase_score
                + cls.POSITION_WEIGHT * position_score
                + cls.INTENT_WEIGHT * intent_score
            )

            scored.append(
                (
                    final_score,
                    chunk,
                )
            )

        scored.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return [
            chunk
            for _, chunk in scored
        ]