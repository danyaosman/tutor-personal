from ai_tutor.models import ResourceChunk


class ContextBuilder:
    """
    Turns retrieved chunks into the final prompt context.

    Responsibilities:
    - remove duplicates
    - add neighbour chunks
    - merge adjacent chunks
    - keep within token budget
    - format for the LLM
    """

    MAX_CONTEXT_TOKENS = 3000

    @staticmethod
    def estimate_tokens(text):
        return max(1, len(text) // 4)

    @classmethod
    def build_context(cls, chunks):

        if not chunks:
            return ""

        chunks = cls.remove_duplicates(chunks)

        chunks = cls.expand_with_neighbors(chunks)

        chunks = cls.remove_duplicates(chunks)

        chunks = cls.merge_adjacent_chunks(chunks)

        chunks = cls.limit_context(chunks)

        return cls.format_context(chunks)

    @staticmethod
    def remove_duplicates(chunks):

        seen = set()
        unique = []

        for chunk in chunks:
            if chunk.id in seen:
                continue

            seen.add(chunk.id)
            unique.append(chunk)

        return unique

    @staticmethod
    def expand_with_neighbors(chunks):

        expanded = {}

        for chunk in chunks:

            expanded[chunk.id] = chunk

            previous_chunk = (
                ResourceChunk.objects.filter(
                    resource=chunk.resource,
                    chunk_index=chunk.chunk_index - 1,
                )
                .select_related("resource")
                .first()
            )

            if previous_chunk:
                expanded[previous_chunk.id] = previous_chunk

            next_chunk = (
                ResourceChunk.objects.filter(
                    resource=chunk.resource,
                    chunk_index=chunk.chunk_index + 1,
                )
                .select_related("resource")
                .first()
            )

            if next_chunk:
                expanded[next_chunk.id] = next_chunk

        return sorted(
            expanded.values(),
            key=lambda c: (
                c.resource_id,
                c.chunk_index,
            ),
        )

    @staticmethod
    def merge_adjacent_chunks(chunks):

        if not chunks:
            return []

        merged = []

        current = chunks[0]

        for chunk in chunks[1:]:

            if (
                chunk.resource_id == current.resource_id
                and chunk.chunk_index == current.chunk_index + 1
            ):

                current.content += "\n\n" + chunk.content

            else:

                merged.append(current)
                current = chunk

        merged.append(current)

        return merged

    @classmethod
    def limit_context(cls, chunks):

        selected = []

        total = 0

        for chunk in chunks:

            tokens = cls.estimate_tokens(chunk.content)

            if total + tokens > cls.MAX_CONTEXT_TOKENS:
                break

            selected.append(chunk)

            total += tokens

        return selected

    @staticmethod
    def format_context(chunks):

        sections = []

        for i, chunk in enumerate(chunks, start=1):

            page = (
                f"Page {chunk.page_number}"
                if chunk.page_number
                else "Unknown page"
            )

            sections.append(
                f"""Source {i}
Resource: {chunk.resource.file_name}
{page}

{chunk.content.strip()}
"""
            )

        return "\n\n-------------------------\n\n".join(sections)