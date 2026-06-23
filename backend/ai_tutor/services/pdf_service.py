from dataclasses import dataclass


class PDFExtractionError(Exception):
    pass


@dataclass(frozen=True)
class PDFPageText:
    page_number: int
    content: str


def normalize_text(text):
    return " ".join(text.split())


def extract_pdf_pages(file_path):
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise PDFExtractionError("pypdf is not installed.") from exc

    try:
        with open(file_path, "rb") as pdf_file:
            reader = PdfReader(pdf_file)
            pages = []
            for page_index, page in enumerate(reader.pages, start=1):
                page_text = normalize_text(page.extract_text() or "")
                if page_text:
                    pages.append(PDFPageText(page_number=page_index, content=page_text))
    except Exception as exc:
        raise PDFExtractionError("Could not extract text from this PDF.") from exc

    if not pages:
        raise PDFExtractionError("No readable text was found in this PDF.")

    return pages
