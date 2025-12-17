import re

def analyze_sentiment(text: str) -> str:
    """
    Analyze the sentiment/urgency of the text based on keywords.
    """
    text_lower = text.lower()
    
    urgent_keywords = ["urgent", "immédiat", "retard", "mise en demeure", "deadline", "important"]
    positive_keywords = ["merci", "plaisir", "accord", "confirmé", "succès", "bien reçu"]
    
    if any(word in text_lower for word in urgent_keywords):
        return "Urgent 🔴"
    elif any(word in text_lower for word in positive_keywords):
        return "Positif 🟢"
    else:
        return "Neutre 🔵"

def summarize_text(text: str) -> str:
    """
    Generate a structured summary of the text.
    """
    lines = text.split('\n')
    summary = []
    
    # Extract potential subject
    subject = "Non identifié"
    for line in lines[:5]: # Check first 5 lines
        if len(line) > 5 and len(line) < 100:
            subject = line.strip()
            break
            
    summary.append(f"📄 **Sujet détecté** : {subject}")
    
    # Extract amounts
    amounts = re.findall(r'\d+[.,]\d{2}\s?€?', text)
    if amounts:
        summary.append(f"💰 **Montants trouvés** : {', '.join(amounts[:3])}")
        
    # Extract dates
    dates = re.findall(r'\d{2}/\d{2}/\d{4}', text)
    if dates:
        summary.append(f"📅 **Dates clés** : {', '.join(dates[:3])}")
        
    # Sentiment
    sentiment = analyze_sentiment(text)
    summary.append(f"mood: {sentiment}")
    
    return "\n".join(summary)

def suggest_reply(context: str) -> str:
    """
    Suggest a reply based on the context/content.
    """
    context_lower = context.lower()
    
    if "facture" in context_lower or "paiement" in context_lower:
        return """Bonjour,

Bien reçu. Le paiement a été programmé et sera effectué dans les plus brefs délais.

Cordialement,"""

    
    elif "rendez-vous" in context_lower or "réunion" in context_lower or "dispo" in context_lower:
        return """Bonjour,

Merci pour votre message. Je suis disponible aux créneaux suivants :
- Lundi matin
- Mercredi après-midi

Dans l'attente de votre confirmation.

Cordialement,"""
    
    elif "candidature" in context_lower or "cv" in context_lower:
        return """Bonjour,

Nous avons bien reçu votre candidature et nous vous en remercions.
Nous reviendrons vers vous sous une semaine après étude de votre dossier.

Cordialement,"""

    else:
        return """Bonjour,

J'ai bien reçu votre message et je vous en remercie.
Je reviens vers vous très rapidement.

Cordialement,"""
