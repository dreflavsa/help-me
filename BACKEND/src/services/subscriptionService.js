const subscriptionRepository = require("../repositories/subscriptionRepository");

// Un seul endroit pour la définition des paliers : si un jour tu changes
// un prix ou un quota, c'est ici et nulle part ailleurs.
const PLANS = {
  GRATUIT: { credits: 5, prixFcfa: 0 },
  STANDARD: { credits: 30, prixFcfa: 1500 },
  PREMIUM: { credits: null, prixFcfa: 6000 }, // null = illimité
};

function dateExpirationDansUnMois() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

class SubscriptionService {
  async creerAbonnementGratuit(utilisateurId) {
    return subscriptionRepository.create({
      utilisateurId,
      plan: "GRATUIT",
      creditsRestants: PLANS.GRATUIT.credits,
      dateExpiration: dateExpirationDansUnMois(),
    });
  }

  // Récupère l'abonnement actif de l'utilisateur. S'il est expiré, il
  // est automatiquement remis à zéro (Gratuit) : aucun paiement n'est
  // encore branché (ce sera le Module 7, CinetPay), donc pour l'instant
  // seul le plan Gratuit peut légitimement "se renouveler" tout seul.
  async getAbonnementActif(utilisateurId) {
    let abonnement =
      await subscriptionRepository.findActiveByUtilisateur(utilisateurId);

    if (!abonnement) {
      await this.creerAbonnementGratuit(utilisateurId);
      abonnement =
        await subscriptionRepository.findActiveByUtilisateur(utilisateurId);
    }

    const estExpire = new Date(abonnement.date_expiration) < new Date();

    if (estExpire) {
      await subscriptionRepository.changerPlan(
        abonnement.id,
        "GRATUIT",
        PLANS.GRATUIT.credits,
        dateExpirationDansUnMois(),
      );

      abonnement =
        await subscriptionRepository.findActiveByUtilisateur(utilisateurId);
    }

    return abonnement;
  }

  async consommerCredit(abonnementId) {
    await subscriptionRepository.decrementerCredits(abonnementId);
  }
  
  async activerPlanPaye(utilisateurId, plan) {
    const infosPlan = PLANS[plan];
    const abonnement =
      await subscriptionRepository.findActiveByUtilisateur(utilisateurId);

    if (abonnement) {
      await subscriptionRepository.changerPlan(
        abonnement.id,
        plan,
        infosPlan.credits,
        dateExpirationDansUnMois(),
      );
    } else {
      await subscriptionRepository.create({
        utilisateurId,
        plan,
        creditsRestants: infosPlan.credits,
        dateExpiration: dateExpirationDansUnMois(),
      });
    }
  }

  getPlans() {
    return PLANS;
  }
}

module.exports = new SubscriptionService();
