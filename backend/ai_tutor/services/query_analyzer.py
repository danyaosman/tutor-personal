import re


class QueryAnalyzer:
    """
    Determines the intent of a student's question.

    The detected intent is later used by the
    ReRankService to slightly favor chunks that are
    more suitable for answering that type of question.

    Supported languages:
    - English
    - Arabic
    """

    SUMMARY_WORDS = {
        # English
        "summarize",
        "summary",
        "overview",
        "outline",

        # Arabic
        "لخص",
        "تلخيص",
        "ملخص",
        "موجز",
    }

    COMPARE_WORDS = {
        # English
        "compare",
        "comparison",
        "difference",
        "differences",
        "versus",
        "vs",
        "similarities",
        "similar",

        # Arabic
        "قارن",
        "مقارنة",
        "الفرق",
        "اختلاف",
        "اختلافات",
        "تشابه",
        "تشابهات",
        "بين",
    }

    EXAMPLE_WORDS = {
        # English
        "example",
        "examples",
        "instance",

        # Arabic
        "مثال",
        "أمثلة",
        "مثالا",
        "مثلاً",
    }

    LIST_WORDS = {
        # English
        "list",
        "enumerate",
        "name",

        # Arabic
        "اذكر",
        "عدد",
        "قائمة",
        "سرد",
    }

    WHY_WORDS = {
        # English
        "why",
        "reason",
        "reasons",
        "cause",
        "causes",

        # Arabic
        "لماذا",
        "ليش",
        "سبب",
        "أسباب",
        "علل",
        "شلون",
    }

    WHAT_WORDS = {
        # English
        "what",
        "define",
        "definition",
        "meaning",

        # Arabic
        "ما",
        "ماهو",
        "ماهي",
        "تعريف",
        "عرف",
        "اشرح",
        "فسر",
    }

    @classmethod
    def analyze(cls, question):
        """
        Returns one of:

        - definition
        - comparison
        - summary
        - example
        - list
        - reasoning
        - general
        """

        question = question.lower()

        words = set(
            re.findall(
                r"\w+",
                question,
                flags=re.UNICODE,
            )
        )

        if words & cls.COMPARE_WORDS:
            return "comparison"

        if words & cls.SUMMARY_WORDS:
            return "summary"

        if words & cls.EXAMPLE_WORDS:
            return "example"

        if words & cls.LIST_WORDS:
            return "list"

        if words & cls.WHY_WORDS:
            return "reasoning"

        if words & cls.WHAT_WORDS:
            return "definition"

        return "general"