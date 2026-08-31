const adminRepository = require("../repositories/adminRepository");
const logIaRepository = require("../repositories/logIaRepository");

const getStats = async (req, res, next) => {
  try {
    const stats = await adminRepository.getStatsGenerales();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getRevenus = async (req, res, next) => {
  try {
    const revenus = await adminRepository.getRevenusParMois();
    return res.status(200).json({ success: true, data: revenus });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { recherche, role, statut } = req.query;
    const utilisateurs = await adminRepository.listUsers({
      recherche,
      role,
      statut,
    });
    return res.status(200).json({ success: true, data: utilisateurs });
  } catch (error) {
    next(error);
  }
};

const desactiverUtilisateur = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.sub) {
      return res.status(400).json({
        success: false,
        code: "CANNOT_DEACTIVATE_SELF",
        message: "Vous ne pouvez pas désactiver votre propre compte.",
      });
    }

    const ok = await adminRepository.setActif(id, false);

    if (!ok) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      code: "USER_DEACTIVATED",
      message: "Compte désactivé.",
    });
  } catch (error) {
    next(error);
  }
};

const reactiverUtilisateur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ok = await adminRepository.setActif(id, true);

    if (!ok) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      code: "USER_REACTIVATED",
      message: "Compte réactivé.",
    });
  } catch (error) {
    next(error);
  }
};

const getStatsIA = async (req, res, next) => {
  try {
    const stats = await logIaRepository.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const listLogsIA = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const logs = await logIaRepository.listerRecents({ statut });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRevenus,
  listUsers,
  desactiverUtilisateur,
  reactiverUtilisateur,
  getStatsIA,
  listLogsIA,
};
