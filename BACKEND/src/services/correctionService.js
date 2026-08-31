const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const correctionRepository = require("../repositories/correctionRepository");
const geminiService = require("../services/geminiService");
const { geminiCorrectionSchema } = require("../validators/correctionValidator");
const notificationRepository = require("../repositories/notificationRepository");
const subscriptionService = require("./subscriptionService");
const logIaRepository = require("../repositories/logIaRepository");

// Types MIME que Gemini sait lire nativement (multimodal).
// Le .docx n'y figure pas volontairement (cf. Module 10 à venir).
const MIME_SUPPORTES_MULTIMODAL = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// Remplacer PROMPT_SYSTEME en entier par :
const PROMPT_SYSTEME = `Tu es un correcteur académique rigoureux et bienveillant.
On va te donner le sujet d'un étudiant (texte et/ou fichier joint).
Détermine toi-même s'il s'agit :
- d'un EXERCICE avec une réponse précise attendue (maths, calcul, question fermée...)
- d'un EXPOSE nécessitant une évaluation qualitative (dissertation, argumentation...)

Règle de langue très importante : réponds toujours dans la MÊME langue que celle utilisée par l'étudiant dans son sujet (titre, consigne, ou contenu du fichier joint). Si l'étudiant écrit en anglais, corrige entièrement en anglais. Si le sujet est en français, réponds en français. Ne mélange jamais les deux langues dans une même réponse.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown, au format exact suivant :
{
  "type": "EXERCICE" ou "EXPOSE",
  "correction": "La correction détaillée, claire et pédagogique, rédigée dans la même langue que le sujet de l'étudiant.",
  "note": un nombre entre 0 et 20, ou null si non pertinent,
  "commentaire": "Un commentaire court et constructif pour l'étudiant, dans la même langue que le sujet."
}
   Consigne de formatage important : n'utilise JAMAIS de notation LaTeX (pas de symboles $, \frac, \sum, \int, \left, \right, etc.). Écris toutes les formules et expressions mathématiques en texte clair et lisible, par exemple :
- Fractions : "2π/T" au lieu de "\frac{2\pi}{T}"
- Exposants : "x^2" ou "x²" au lieu de "x^{2}"
- Indices : "a_n" ou "aₙ" au lieu de "a_{n}"
- Sommes/intégrales : décris-les en mots si besoin ("la somme pour n allant de 1 à l'infini de...") plutôt qu'en symboles LaTeX
- Symboles grecs : écris-les directement (π, ω, α...) plutôt que "\pi", "\omega", "\alpha"`;

class CorrectionService {
  async genererCorrection(soumissionId, utilisateurId, abonnementId) {
    const soumission = await correctionRepository.findSoumissionForCorrection(
      soumissionId,
      utilisateurId,
    );

    if (!soumission) {
      return {
        success: false,
        code: "SOUMISSION_NOT_FOUND",
        message: "Soumission introuvable.",
      };
    }

    // On empêche de relancer une correction déjà en cours ou déjà
    // terminée — évite les doubles appels (double clic, requêtes
    // en rafale) qui gaspilleraient inutilement le quota Gemini.
    if (soumission.statut === "EN_COURS") {
      return {
        success: false,
        code: "CORRECTION_EN_COURS",
        message: "Cette soumission est déjà en cours de correction.",
      };
    }

    if (soumission.statut === "TERMINEE") {
      return {
        success: false,
        code: "CORRECTION_DEJA_TERMINEE",
        message: "Cette soumission a déjà été corrigée.",
      };
    }

    await correctionRepository.updateSoumissionStatut(soumissionId, "EN_COURS");

    const debut = Date.now();

    try {
      const parts = await this._construirePrompt(soumission);

      const { texte: texteReponse, usage } =
        await geminiService.generateContent(parts);

      const donneesCorrection = this._parserReponseJSON(texteReponse);

      const dureeTraitement = Math.round((Date.now() - debut) / 1000);

      try {
        await logIaRepository.enregistrerSucces({
          utilisateurId,
          soumissionId,
          modele: process.env.GEMINI_MODEL,
          usage,
          dureeMs: Date.now() - debut,
        });
      } catch (error) {
        await correctionRepository.updateSoumissionStatut(
          soumissionId,
          "ECHEC",
        );

        console.error("Erreur génération correction :", error.message);

        try {
          await logIaRepository.enregistrerEchec({
            utilisateurId,
            soumissionId,
            modele: process.env.GEMINI_MODEL,
            dureeMs: Date.now() - debut,
            messageErreur: error.message,
          });
        } catch (logError) {
          console.error("Erreur enregistrement log IA :", logError.message);
        }
      }

      const correctionId = await correctionRepository.createCorrection({
        soumissionId,
        contenu: donneesCorrection.correction,
        note: donneesCorrection.note,
        commentaire: donneesCorrection.commentaire,
        dureeTraitement,
        modeleIA: process.env.GEMINI_MODEL,
      });

      await correctionRepository.updateSoumissionStatut(
        soumissionId,
        "TERMINEE",
      );
      try {
        await subscriptionService.consommerCredit(abonnementId);
      } catch (error) {
        console.error("Erreur décrémentation crédit :", error.message);
      }

      try {
        await notificationRepository.create({
          utilisateurId,
          typeNotificationId: 2, // code CORRECTION, cf. types_notifications
          titre: "Correction disponible",
          message: `Ta correction pour "${soumission.titre}" est prête.`,
        });
      } catch (error) {
        console.error("Erreur création notification :", error.message);
      }

      return {
        success: true,
        code: "CORRECTION_GENERATED",
        message: "Correction générée avec succès.",
        data: { id: correctionId, ...donneesCorrection },
      };
    } catch (error) {
      await correctionRepository.updateSoumissionStatut(soumissionId, "ECHEC");

      console.error("Erreur génération correction :", error.message);

      if (error.message === "DOCX_VIDE") {
        return {
          success: false,
          code: "FICHIER_DOCX_VIDE",
          message:
            "Le fichier Word joint semble vide ou illisible. Vérifie son contenu, ou soumets-le en PDF/image.",
        };
      }

      return {
        success: false,
        code: "CORRECTION_FAILED",
        message:
          "La génération de la correction a échoué. Vous pouvez réessayer.",
      };
    }
  }

  async _construirePrompt(soumission) {
    const parts = [
      { text: PROMPT_SYSTEME },
      { text: `\n\nTitre du sujet : ${soumission.titre}` },
    ];

    if (soumission.consigne) {
      parts.push({ text: `\nConsigne : ${soumission.consigne}` });
    }

    if (soumission.fichier_chemin && soumission.fichier_extension === ".docx") {
      const texteExtrait = await this._extraireTexteDocx(
        soumission.fichier_chemin,
      );

      parts.push({
        text: `\nContenu du fichier joint (.docx) :\n${texteExtrait}`,
      });
    } else if (
      soumission.fichier_chemin &&
      MIME_SUPPORTES_MULTIMODAL.includes(soumission.fichier_mime)
    ) {
      const fileBuffer = await fs.promises.readFile(soumission.fichier_chemin);

      parts.push({
        inlineData: {
          mimeType: soumission.fichier_mime,
          data: fileBuffer.toString("base64"),
        },
      });
    }

    return parts;
  }

  async _extraireTexteDocx(cheminFichier) {
    const { value: texte } = await mammoth.extractRawText({
      path: cheminFichier,
    });

    if (!texte || !texte.trim()) {
      throw new Error("DOCX_VIDE");
    }

    return texte.trim();
  }

  _parserReponseJSON(texte) {
    const texteNettoye = texte
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "");

    let donneesBrutes;

    try {
      donneesBrutes = JSON.parse(texteNettoye);
    } catch (error) {
      throw new Error(`Réponse Gemini non-JSON : ${texte.slice(0, 200)}`);
    }

    const resultat = geminiCorrectionSchema.safeParse(donneesBrutes);

    if (!resultat.success) {
      throw new Error(
        `Réponse Gemini invalide : ${JSON.stringify(resultat.error.issues)}`,
      );
    }

    return resultat.data;
  }

  async getCorrection(soumissionId, utilisateurId) {
    const soumission = await correctionRepository.findSoumissionForCorrection(
      soumissionId,
      utilisateurId,
    );

    if (!soumission) {
      return {
        success: false,
        code: "SOUMISSION_NOT_FOUND",
        message: "Soumission introuvable.",
      };
    }

    const correction =
      await correctionRepository.findCorrectionBySoumissionId(soumissionId);

    if (!correction) {
      return {
        success: false,
        code: "CORRECTION_NOT_FOUND",
        message: "Aucune correction disponible pour cette soumission.",
      };
    }

    return {
      success: true,
      code: "CORRECTION_FOUND",
      message: "Correction récupérée.",
      data: correction,
    };
  }
}

module.exports = new CorrectionService();
