const profilService = require("../services/profilService");

const getProfil = async (req, res, next) => {
    try {
        const result = await profilService.getProfil(req.user.sub);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const updateProfil = async (req, res, next) => {
    try {
        const result = await profilService.updateProfil(req.user.sub, req.body);

        if (!result.success) {
            return res.status(409).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfil,
    updateProfil,
};
