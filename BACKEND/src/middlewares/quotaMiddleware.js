const subscriptionService = require("../services/subscriptionService");

module.exports = async (req, res, next) => {
  try {
    const abonnement = await subscriptionService.getAbonnementActif(
      req.user.sub,
    );

    if (
      abonnement.credits_restants !== null &&
      abonnement.credits_restants <= 0
    ) {
      return res.status(403).json({
        success: false,
        code: "QUOTA_EPUISE",
        message:
          "Tu as utilisé tous tes crédits de correction pour ce mois. Passe à un plan supérieur pour continuer.",
      });
    }

    // Transmis au contrôleur suivant pour décrémenter le crédit
    // une fois (et seulement si) la correction réussit.
    req.abonnementId = abonnement.id;

    next();
  } catch (error) {
    next(error);
  }
};
