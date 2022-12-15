import magic  # https://github.com/ahupp/python-magic
import mimetypes
from PyPDF2 import PdfReader  # https://github.com/py-pdf/PyPDF2
from docx import Document  # https://github.com/python-openxml/python-docx
from striprtf.striprtf import rtf_to_text  # https://pypi.org/project/striprtf/
from odf import text, teletype  # https://pypi.org/project/odfpy/
from odf.opendocument import load


def txt_to_str(file_name):
    with open(file_name, "r", encoding="utf-8") as f:
        string = "".join(line for line in f)
    return string


def pdf_to_str(file_name):
    reader = PdfReader(file_name)
    return "".join(page.extract_text() for page in reader.pages)


def docx_to_str(file_name):
    doc = Document(file_name)
    return "\n".join(p.text for p in doc.paragraphs)


def rtf_to_str(file_name):
    with open(file_name, "r", encoding="utf-8") as f:
        string = rtf_to_text(f.read())
    return string


def odt_to_str(file_name):
    textdoc = load(file_name)
    paragraphs = textdoc.getElementsByType(text.P)
    return "\n".join(teletype.extractText(p).strip() for p in paragraphs)


# ritorna una stringa ".estensione"
def extract_file_extension(file_name):
    mime = magic.from_file(file_name, mime=True)
    
    if mime == "text/rtf":
        return ".rtf"
    
    return mimetypes.guess_extension(mime)


def extract_text_from_file(file_name):
    extension = extract_file_extension(file_name)
    
    if extension == ".txt":
        return txt_to_str(file_name)
    
    elif extension == ".pdf":
        return pdf_to_str(file_name)
    
    elif extension == ".docx":
        return docx_to_str(file_name)
    
    elif extension == ".rtf":
        return rtf_to_str(file_name)
    
    elif extension == ".odt":
        return odt_to_str(file_name)
    
    else:
        return None
