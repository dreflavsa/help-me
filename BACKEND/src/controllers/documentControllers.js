const path = require("path");

const documentService = require("../services/documentService");

// ==========================================================
// GÉNÉRER UN DOCUMENT
// ==========================================================

const genererDocument = async (req, res, next) => {
  try {
    const result = await documentService.genererDocument({
      soumissionId: req.params.id,

      utilisateurId: req.user.sub,

      // Logo facultatif
      logoFile: req.file,

      fileValidationError: req.fileValidationError,
    });

    if (!result.success) {
      const statusMap = {
        LOGO_FORMAT_NON_AUTORISE: 422,

        CORRECTION_NOT_FOUND: 404,

        DOCUMENT_NOT_FOUND: 404,
      };

      return res.status(statusMap[result.code] || 400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erreur génération document :", error);

    next(error);
  }
};

// ==========================================================
// TÉLÉCHARGER UN DOCUMENT
// ==========================================================

const telechargerDocument = async (req, res, next) => {
  try {
    const result = await documentService.getCheminPourTelechargement(
      req.params.id,
      req.user.sub,
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.download(
      path.resolve(result.data.chemin),
      result.data.nom_fichier,
    );
  } catch (error) {
    console.error("Erreur téléchargement document :", error);

    next(error);
  }
};

module.exports = {
  genererDocument,
  telechargerDocument,
};
