from datetime import datetime

TEMPLATES = {
    # --- FACTURATION ---
    "facture_paiement": {
        "subject": "Preuve de virement - Facture {context}",
        "body": """Bonjour,

Veuillez trouver ci-joint la preuve de virement concernant la facture : {context}.

Le paiement a été effectué ce jour. Je vous remercie de bien vouloir m'accuser réception de ce règlement et de mettre à jour mon dossier.

Cordialement,
"""
    },
    "facture_relance": {
        "subject": "Relance facture impayée - {context}",
        "body": """Madame, Monsieur,

Sauf erreur ou omission de ma part, le paiement de la facture référencée {context} ne nous est pas encore parvenu.

Je vous prie de bien vouloir procéder au règlement dans les plus brefs délais.

Si le virement a déjà été effectué, merci de ne pas tenir compte de ce courriel.

Cordialement,
"""
    },
    "facture_contestation": {
        "subject": "Contestation de facture - {context}",
        "body": """Madame, Monsieur,

Je fais suite à la réception de la facture n°{context}.

Après vérification, je constate une erreur concernant [DÉTAIL_ERREUR]. En conséquence, je conteste le montant réclamé.

Je vous remercie de bien vouloir procéder aux vérifications nécessaires et de m'adresser un avoir ou une facture rectificative.

Dans l'attente de votre retour,
Cordialement,
"""
    },

    # --- RH (Ressources Humaines) ---
    "rh_convocation": {
        "subject": "Convocation à un entretien - {context}",
        "body": """Bonjour,

Suite à notre échange, j'ai le plaisir de vous confirmer votre entretien prévu le [DATE] à [HEURE] concernant : {context}.

L'entretien se déroulera [LIEU/VISIO].

Merci de me confirmer votre présence.

Cordialement,
"""
    },
    "rh_offre": {
        "subject": "Proposition de collaboration - {context}",
        "body": """Bonjour,

Nous avons été très intéressés par votre profil.

Dans le cadre de notre recherche pour {context}, nous souhaiterions vous proposer une collaboration.

Seriez-vous disponible pour un bref échange téléphonique cette semaine ?

Bien à vous,
"""
    },

    # --- LOGEMENT ---
    "logement_preavis": {
        "subject": "Préavis de départ - {context}",
        "body": """Objet : Résiliation de bail et préavis de départ

Madame, Monsieur,

Par la présente, je vous informe de mon intention de quitter le logement situé à {context}.

Conformément à la législation en vigueur, je respecterai un préavis de [DURÉE], mon départ étant effectif le [DATE_FIN].

Je reste à votre disposition pour convenir d'une date pour l'état des lieux de sortie.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
"""
    },
    "logement_sinistre": {
        "subject": "Déclaration de sinistre - {context}",
        "body": """Madame, Monsieur,

Je vous informe par la présente d'un sinistre survenu dans mon logement : {context}.

Nature du sinistre : [DÉGÂT DES EAUX / ELECTRIQUE / AUTRE]
Date de constatation : {date}

J'ai pris les premières mesures conservatoires. Je reste dans l'attente de vos instructions pour la suite des démarches (expertise, réparations).

Cordialement,
"""
    },

    # --- DIRECTION / ADMIN ---
    "direction_cr": {
        "subject": "Compte-rendu : {context}",
        "body": """Bonjour à tous,

Voici le compte-rendu des points abordés concernant : {context}.

POINTS CLÉS :
- [POINT 1]
- [POINT 2]

ACTIONS À MENIR :
- [ACTION] (Responsable : [NOM])

Prochaine échéance : [DATE]

Cordialement,
"""
    },
    "direction_note": {
        "subject": "Note de service - {context}",
        "body": """NOTE D'INFORMATION

Objet : {context}

À l'attention de l'ensemble des collaborateurs,

Nous vous informons que [INFORMATION PRINCIPALE].

Cette mesure prendra effet à compter du {date}.

Merci de votre prise en compte.

La Direction.
"""
    },

    # --- URGENCE ---
    "urgence_signalement": {
        "subject": "URGENCE : Signalement critique - {context}",
        "body": """URGENT

Je souhaite signaler un incident critique concernant : {context}.

Niveau de gravité : ÉLEVÉ
Date/Heure : {date}

Action immédiate requise. Merci d'intervenir ou de confirmer la réception de ce message au plus vite.

Cordialement,
"""
    },
    
    # --- DIVERS ---
    "email_rdv": {
        "subject": "Confirmation de rendez-vous - {context}",
        "body": """Bonjour,

Je vous confirme notre rendez-vous pour : {context}.

Merci de me tenir informé en cas de changement.

Cordialement,
"""
    }
}

def generate_document(template_type: str, context: str) -> dict:
    template = TEMPLATES.get(template_type)
    if not template:
        return {"subject": "Erreur", "body": "Modèle introuvable."}
    
    today = datetime.now().strftime("%d/%m/%Y")
    
    subject = template["subject"].format(context=context)
    body = template["body"].format(context=context, date=today)
    
    return {"subject": subject, "body": body}
