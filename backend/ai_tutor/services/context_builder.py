from ai_tutor.models import ResourceChunk


class ContextBuilder:
  

    MAX_CONTEXT_TOKENS = 3000

    @staticmethod
    def estimate_tokens(text):
        return max(1, len(text) // 4)

    @classmethod
    def build_context(cls, chunks):

        chunks = cls.expand_with_neighbors(chunks)

        chunks = cls.merge_adjacent_chunks(chunks)

        chunks = cls.limit_context(chunks)

        return cls.format_context(chunks)

    @staticmethod
    def expand_with_neighbors(chunks):
    

        expanded = []

        seen = set()

        for chunk in chunks:

            neighbors = list(
                ResourceChunk.objects.filter(
                    resource=chunk.resource,
                    chunk_index__gte=chunk.chunk_index - 1,
                    chunk_index__lte=chunk.chunk_index + 1,
                )
                .select_related("resource")
                .order_by("chunk_index")
            )

            for neighbor in neighbors:

                if neighbor.id not in seen:

                    seen.add(neighbor.id)

                    expanded.append(neighbor)

        return expanded

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
       

        total_tokens = 0

        selected = []

        for chunk in chunks:

            tokens = cls.estimate_tokens(chunk.content)

            if total_tokens + tokens > cls.MAX_CONTEXT_TOKENS:
                break

            selected.append(chunk)

            total_tokens += tokens

        return selected

    @staticmethod
    def format_context(chunks):
      

        sections = []

        for index, chunk in enumerate(chunks, start=1):

            page = (
                f"Page {chunk.page_number}"
                if chunk.page_number
                else "Unknown page"
            )

            sections.append(
                f"""
Source {index}
Resource: {chunk.resource.file_name}
{page}

{chunk.content.strip()}
""".strip()
            )

        return "\n\n----------------------------------------\n\n".join(
            sections
        )