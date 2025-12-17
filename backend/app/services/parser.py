import os
import pandas as pd
from pypdf import PdfReader
from docx import Document

def extract_text_from_file(file_path: str, filename: str) -> str:
    """
    Extracts text content from PDF, Excel, or Word files.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    try:
        if ext == '.pdf':
            return _parse_pdf(file_path)
        elif ext in ['.xlsx', '.xls']:
            return _parse_excel(file_path)
        elif ext in ['.docx', '.doc']:
            return _parse_word(file_path)
        elif ext in ['.txt', '.md']:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            return f"Format de fichier non supporté pour l'analyse automatique: {ext}"
    except Exception as e:
        return f"Erreur lors de l'analyse du fichier: {str(e)}"

def _parse_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text_page = page.extract_text()
        if text_page:
            text += text_page + "\n"
    return text.strip()

def _parse_excel(file_path: str) -> str:
    # Read first sheet
    df = pd.read_excel(file_path)
    # Summary of the dataframe
    summary = f"Fichier Excel: {os.path.basename(file_path)}\n"
    summary += f"Colonnes: {', '.join(df.columns.astype(str))}\n"
    summary += f"Nombre de lignes: {len(df)}\n\n"
    summary += "Aperçu des données (5 premières lignes):\n"
    summary += df.head().to_string()
    return summary

def _parse_word(file_path: str) -> str:
    doc = Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text.strip()
