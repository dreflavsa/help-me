const soumissionService = require("../services/soumissionService");

const create = async (req, res, next) => {
    try {
        const result = await soumissionService.create({
            utilisateurId: req.user.sub, // vient du JWT décodé par authMiddleware
            titre: req.body.titre,
            consigne: req.body.consigne,
            matiere: req.body.matiere,
            fichier: req.file, // undefined si aucun fichier envoyé
            fileValidationError: req.fileValidationError,
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const list = async (req, res, next) => {
    try {
        const result = await soumissionService.list(req.user.sub);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getOne = async (req, res, next) => {
    try {
        const result = await soumissionService.getOne(
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
    create,
    list,
    getOne,
};
