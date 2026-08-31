const fs = require("fs");
const path = require("path");

const soumissionRepository = require("../repositories/soumissionRepository");
const profilRepository = require("../repositories/profilRepository");

class SoumissionService {
  async create({
    utilisateurId,
    titre,
    consigne,
    matiere,
    fichier,
    fileValidationError,
  }) {
    if (fileValidationError) {
      return {
        success: false,
        code: "FICHIER_NON_AUTORISE",
        message:
          "Le format du fichier n'est pas autorisé. Formats acceptés : PDF, JPG, PNG, DOCX.",
      };
    }

    const profil = await profilRepository.findProfilById(utilisateurId);

    let matiereTrouvee = await soumissionRepository.findMatiereByName(
      matiere,
      profil.filiere_id,
      profil.niveau_id,
    );

    if (!matiereTrouvee) {
      const matiereId = await soumissionRepository.createMatiere(
        matiere,
        profil.filiere_id,
        profil.niveau_id,
      );
      matiereTrouvee = { id: matiereId, nom: matiere.trim() };
    }

    try {
      const fichierData = fichier
        ? {
            originalname: fichier.originalname,
            filename: fichier.filename,
            path: fichier.path,
            mimetype: fichier.mimetype,
            extension: path.extname(fichier.originalname).toLowerCase(),
            size: fichier.size,
          }
        : null;

      const soumissionId = await soumissionRepository.createSoumission({
        utilisateurId,
        matiereId: matiereTrouvee.id,
        titre,
        consigne,
        fichier: fichierData,
      });

      return {
        success: true,
        code: "SOUMISSION_CREATED",
        message: "Sujet soumis avec succès.",
        data: { id: soumissionId },
      };
    } catch (error) {
      if (fichier) {
        await this._deleteFileQuietly(fichier.path);
      }

      throw error;
    }
  }

  async list(utilisateurId) {
    const soumissions =
      await soumissionRepository.findByUtilisateur(utilisateurId);

    return {
      success: true,
      code: "SOUMISSIONS_LISTED",
      message: "Liste des soumissions récupérée.",
      data: soumissions,
    };
  }

  async getOne(id, utilisateurId) {
    const soumission = await soumissionRepository.findByIdAndUtilisateur(
      id,
      utilisateurId,
    );

    if (!soumission) {
      return {
        success: false,
        code: "SOUMISSION_NOT_FOUND",
        message: "Soumission introuvable.",
      };
    }

    return {
      success: true,
      code: "SOUMISSION_FOUND",
      message: "Soumission récupérée.",
      data: soumission,
    };
  }

  async _deleteFileQuietly(filePath) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error("Erreur suppression fichier orphelin :", error.message);
    }
  }
}

module.exports = new SoumissionService();
