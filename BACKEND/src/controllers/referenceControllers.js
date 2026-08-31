const referenceRepository = require("../repositories/referenceRepository");

const getFilieres = async (req, res, next) => {
    try {
        const filieres = await referenceRepository.findAllFilieres();

        return res.status(200).json({ success: true, data: filieres });
    } catch (error) {
        next(error);
    }
};

const getNiveaux = async (req, res, next) => {
    try {
        const niveaux = await referenceRepository.findAllNiveaux();

        return res.status(200).json({ success: true, data: niveaux });
    } catch (error) {
        next(error);
    }
};
const getMatieres = async (req, res, next) => {
    try {
        const matieres = await referenceRepository.findAllMatieres();

        return res.status(200).json({ success: true, data: matieres });
    } catch (error) {
        next(error);
    }
};

module.exports = { getFilieres, getNiveaux, getMatieres };
