from datetime import datetime

TEMPLATES = {
    # --- FACTURATION & FINANCE ---
    "facture_paiement": {
        "subject": "Preuve de virement - Facture {context}",
        "body": """Bonjour,

Veuillez trouver ci-joint la preuve de virement concernant la facture : {context}.

Le paiement a été effectué ce jour. Je vous remercie de bien vouloir m'accuser réception de ce règlement et de mettre à jour mon dossier.

Cordialement,
"""
    },
    "facture_relance_1": {
        "subject": "Rappel : Facture en attente - {context}",
        "body": """Madame, Monsieur,

Sauf erreur ou omission de ma part, le paiement de la facture référencée {context} ne nous est pas encore parvenu.

Il s'agit sans doute d'un simple oubli. Je vous prie de bien vouloir procéder au règlement dans les plus brefs délais.

Si le virement a déjà été effectué, merci de ne pas tenir compte de ce courriel.

Cordialement,
"""
    },
    "facture_relance_2": {
        "subject": "Relance : Facture impayée - {context}",
        "body": """Madame, Monsieur,

Malgré ma précédente relance, je constate que la facture {context} reste impayée à ce jour.

Je vous demande de bien vouloir régulariser votre situation immédiatement.

Cordialement,
"""
    },
    "facture_mise_demeure": {
        "subject": "MISE EN DEMEURE - Facture {context}",
        "body": """Madame, Monsieur,

Par la présente, je vous mets en demeure de régler la somme due au titre de la facture {context} sous 8 jours.

À défaut de paiement dans ce délai, je me verrai contraint d'engager les procédures légales nécessaires au recouvrement de cette créance.

Cette lettre vaut mise en demeure de payer.

Salutations distinguées,
"""
    },
    "facture_contestation": {
        "subject": "Contestation de facture - {context}",
        "body": """Madame, Monsieur,

Je fais suite à la réception de la facture n°{context}.

Après vérification, je constate une erreur. En conséquence, je conteste le montant réclamé.

Je vous remercie de bien vouloir procéder aux vérifications nécessaires et de m'adresser un avoir ou une facture rectificative.

Cordialement,
"""
    },
    "facture_devis": {
        "subject": "Proposition commerciale / Devis - {context}",
        "body": """Bonjour,

Suite à nos échanges, j'ai le plaisir de vous transmettre notre proposition commerciale pour : {context}.

Vous trouverez le détail de l'offre en pièce jointe (ou ci-dessous).

Je reste à votre disposition pour toute question.

Cordialement,
"""
    },
    "finance_rib": {
        "subject": "Envoi de RIB - {context}",
        "body": """Bonjour,

Veuillez trouver ci-joint mon Relevé d'Identité Bancaire (RIB) pour le dossier : {context}.

Merci de bien vouloir faire le nécessaire pour les futurs virements/prélèvements.

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
    "rh_promesse": {
        "subject": "Promesse d'embauche - {context}",
        "body": """Madame, Monsieur,

Nous avons le plaisir de vous confirmer notre intention de vous engager au poste de {context}.

Date de début : [DATE]
Rémunération : [MONTANT]

Cette promesse d'embauche vaut contrat de travail sous réserve de la validation de votre période d'essai.

Cordialement,
"""
    },
    "rh_avertissement": {
        "subject": "Avertissement - {context}",
        "body": """Monsieur/Madame,

Par la présente, nous vous notifions un avertissement suite aux faits suivants : {context}.

Nous vous demandons de bien vouloir rectifier votre comportement/travail à l'avenir.

Cordialement,
La Direction
"""
    },
    "rh_certificat": {
        "subject": "Certificat de travail - {context}",
        "body": """ATTESTATION

Je soussigné(e), [NOM EMPLOYEUR], certifie que [NOM SALARIÉ] a été employé(e) au sein de notre société en qualité de {context}.

Date d'entrée : [DATE]
Date de sortie : [DATE]

Il/Elle nous quitte libre de tout engagement.

Fait pour servir et valoir ce que de droit.
"""
    },
    "rh_conges_validation": {
        "subject": "Validation de vos congés - {context}",
        "body": """Bonjour,

J'ai le plaisir de vous informer que votre demande de congés pour la période {context} a été validée.

Profitez bien de ce repos !

Cordialement,
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
    "logement_quittance": {
        "subject": "Quittance de loyer - {context}",
        "body": """QUITTANCE DE LOYER

Période : {context}
Adresse : [ADRESSE]

Je soussigné(e), [PROPRIÉTAIRE], certifie avoir reçu de [LOCATAIRE] la somme de [MONTANT] euros en paiement du loyer et des charges pour la période susmentionnée.

Dont Loyer : [MONTANT]
Dont Charges : [MONTANT]

Fait le {date}.
"""
    },
    "logement_travaux": {
        "subject": "Demande de travaux - {context}",
        "body": """Madame, Monsieur,

Je me permets de vous solliciter concernant des réparations nécessaires dans le logement : {context}.

En effet, j'ai constaté [DESCRIPTION PROBLÈME].

Ces réparations incombant au propriétaire, je vous remercie de bien vouloir faire le nécessaire dans les meilleurs délais.

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
    "direction_odj": {
        "subject": "Ordre du jour - {context}",
        "body": """Bonjour,

Voici l'ordre du jour pour la réunion concernant : {context}.

Date : [DATE]
Heure : [HEURE]

ORDRE DU JOUR :
1. Introduction
2. Point sur l'avancement
3. Questions diverses

Merci de préparer vos interventions.

Cordialement,
"""
    },
    "admin_procuration": {
        "subject": "Procuration - {context}",
        "body": """PROCURATION

Je soussigné(e), [NOM MANDANT], né(e) le [DATE] à [LIEU], demeurant à [ADRESSE],

Donne par la présente procuration à :
[NOM MANDATAIRE], né(e) le [DATE], demeurant à [ADRESSE],

Pour effectuer en mon nom et pour mon compte les démarches suivantes concernant : {context}.

Cette procuration est valable jusqu'au [DATE].

Fait le {date}.
"""
    },
    "admin_resiliation": {
        "subject": "Demande de résiliation - {context}",
        "body": """Madame, Monsieur,

Par la présente, je vous informe de ma volonté de résilier mon contrat n°[NUMÉRO] concernant : {context}.

Je souhaite que cette résiliation prenne effet à compter du [DATE], conformément aux conditions générales de vente.

Je vous remercie de me confirmer la prise en compte de cette demande et de m'adresser une facture de clôture.

Cordialement,
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

def generate_document(template_type: str, context: str, user_input: str = "") -> dict:
    template = TEMPLATES.get(template_type)
    if not template:
        return {"subject": "Erreur", "body": "Modèle introuvable."}
    
    today = datetime.now().strftime("%d/%m/%Y")
    
    subject = template["subject"].format(context=context)
    body = template["body"].format(context=context, date=today)
    
    if user_input:
        body += f"\n\n[Instructions supplémentaires : {user_input}]"
        # Or better, insert it before the closing
        # For now, appending is safer to avoid breaking format
    
    return {"subject": subject, "body": body}
