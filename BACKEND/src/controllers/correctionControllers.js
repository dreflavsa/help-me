const correctionService = require("../services/correctionService");

const corriger = async (req, res, next) => {
  try {
    const result = await correctionService.genererCorrection(
      req.params.id,
      req.user.sub,
      req.abonnementId,
    );

    if (!result.success) {
      const statusMap = {
        SOUMISSION_NOT_FOUND: 404,
        CORRECTION_EN_COURS: 409,
        CORRECTION_DEJA_TERMINEE: 409,
        FORMAT_NON_SUPPORTE_POUR_CORRECTION: 422,
        CORRECTION_FAILED: 502,
        QUOTA_EPUISE: 403,
      };

      return res.status(statusMap[result.code] || 400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getCorrection = async (req, res, next) => {
  try {
    const result = await correctionService.getCorrection(
      req.params.id,
      req.user.sub,
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  corriger,
  getCorrection,
};
