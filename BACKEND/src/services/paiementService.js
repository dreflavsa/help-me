const paiementRepository = require("../repositories/paiementRepository");
const subscriptionService = require("./subscriptionService");
const notificationRepository = require("../repositories/notificationRepository");

const TYPE_NOTIFICATION_PAIEMENT = 3;

class PaiementService {
  async declarer({ utilisateurId, plan, montant, numeroPayeur, reference }) {
    const plans = subscriptionService.getPlans();
    const infosPlan = plans[plan];

    if (montant !== infosPlan.prixFcfa) {
      return {
        success: false,
        code: "MONTANT_INCORRECT",
        message: `Le montant attendu pour le pack ${plan} est de ${infosPlan.prixFcfa} FCFA.`,
      };
    }

    const referenceExistante =
      await paiementRepository.findByReference(reference);

    if (referenceExistante) {
      return {
        success: false,
        code: "REFERENCE_DEJA_UTILISEE",
        message:
          "Cette référence de transaction a déjà été déclarée. Vérifie-la, ou contacte le support si tu penses qu'il y a une erreur.",
      };
    }

    const id = await paiementRepository.create({
      utilisateurId,
      plan,
      montant,
      numeroPayeur,
      reference,
    });

    return {
      success: true,
      code: "DEMANDE_CREEE",
      message:
        "Ta demande a bien été envoyée. Un administrateur va vérifier ton paiement sous peu.",
      data: { id },
    };
  }

  async listerEnAttente() {
    const demandes = await paiementRepository.findEnAttente();
    return { success: true, data: demandes };
  }

  async historique(statut) {
    const demandes = await paiementRepository.findHistorique({ statut });
    return { success: true, data: demandes };
  }

  async valider(demandeId, adminId) {
    const demande = await paiementRepository.findById(demandeId);

    if (!demande) {
      return {
        success: false,
        code: "DEMANDE_NOT_FOUND",
        message: "Demande introuvable.",
      };
    }

    if (demande.statut !== "EN_ATTENTE") {
      return {
        success: false,
        code: "DEMANDE_DEJA_TRAITEE",
        message: "Cette demande a déjà été traitée.",
      };
    }

    await paiementRepository.updateStatut(demandeId, "VALIDE", adminId);
    await subscriptionService.activerPlanPaye(
      demande.utilisateur_id,
      demande.plan,
    );

    try {
      await notificationRepository.create({
        utilisateurId: demande.utilisateur_id,
        typeNotificationId: TYPE_NOTIFICATION_PAIEMENT,
        titre: "Paiement validé et pack activé",
        message: `Ton paiement pour le pack ${demande.plan} a été validé. Ton abonnement est maintenant actif.`,
      });
    } catch (error) {
      console.error("Erreur création notification :", error.message);
    }

    return {
      success: true,
      code: "PAIEMENT_VALIDE",
      message: "Paiement validé, pack activé.",
    };
  }

  async refuser(demandeId, adminId, motif) {
    const demande = await paiementRepository.findById(demandeId);

    if (!demande) {
      return {
        success: false,
        code: "DEMANDE_NOT_FOUND",
        message: "Demande introuvable.",
      };
    }

    if (demande.statut !== "EN_ATTENTE") {
      return {
        success: false,
        code: "DEMANDE_DEJA_TRAITEE",
        message: "Cette demande a déjà été traitée.",
      };
    }

    await paiementRepository.updateStatut(
      demandeId,
      "REFUSE",
      adminId,
      motif || null,
    );

    try {
      await notificationRepository.create({
        utilisateurId: demande.utilisateur_id,
        typeNotificationId: TYPE_NOTIFICATION_PAIEMENT,
        titre: "Paiement refusé",
        message: motif
          ? `Ton paiement pour le pack ${demande.plan} a été refusé : ${motif}`
          : `Ton paiement pour le pack ${demande.plan} a été refusé. Contacte le support pour plus d'informations.`,
      });
    } catch (error) {
      console.error("Erreur création notification :", error.message);
    }

    return {
      success: true,
      code: "PAIEMENT_REFUSE",
      message: "Paiement refusé.",
    };
  }
}

module.exports = new PaiementService();
