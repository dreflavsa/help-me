const subscriptionService = require("../services/subscriptionService");

const getMonAbonnement = async (req, res, next) => {
  try {
    const abonnement = await subscriptionService.getAbonnementActif(
      req.user.sub,
    );

    return res.status(200).json({ success: true, data: abonnement });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMonAbonnement };
