const paiementService = require("../services/paiementService");

const declarer = async (req, res, next) => {
  try {
    const result = await paiementService.declarer({
      utilisateurId: req.user.sub,
      plan: req.body.plan,
      montant: req.body.montant,
      numeroPayeur: req.body.numero_payeur,
      reference: req.body.reference_transaction,
    });

    if (!result.success) {
      const statusMap = {
        MONTANT_INCORRECT: 422,
        REFERENCE_DEJA_UTILISEE: 409,
      };
      return res.status(statusMap[result.code] || 400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listerEnAttente = async (req, res, next) => {
  try {
    const result = await paiementService.listerEnAttente();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const historique = async (req, res, next) => {
  try {
    const result = await paiementService.historique(req.query.statut);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const valider = async (req, res, next) => {
  try {
    const result = await paiementService.valider(req.params.id, req.user.sub);

    if (!result.success) {
      const statusMap = { DEMANDE_NOT_FOUND: 404, DEMANDE_DEJA_TRAITEE: 409 };
      return res.status(statusMap[result.code] || 400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const refuser = async (req, res, next) => {
  try {
    const result = await paiementService.refuser(
      req.params.id,
      req.user.sub,
      req.body.motif,
    );

    if (!result.success) {
      const statusMap = { DEMANDE_NOT_FOUND: 404, DEMANDE_DEJA_TRAITEE: 409 };
      return res.status(statusMap[result.code] || 400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { declarer, listerEnAttente, historique, valider, refuser };
