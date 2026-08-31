const notificationRepository = require("../repositories/notificationRepository");

const lister = async (req, res, next) => {
    try {
        const [notifications, nonLues] = await Promise.all([
            notificationRepository.findByUtilisateur(req.user.sub),
            notificationRepository.countNonLues(req.user.sub),
        ]);

        return res.status(200).json({
            success: true,
            data: { notifications, nonLues },
        });
    } catch (error) {
        next(error);
    }
};

const marquerCommeLue = async (req, res, next) => {
    try {
        await notificationRepository.marquerCommeLue(req.params.id, req.user.sub);

        return res.status(200).json({ success: true, code: "NOTIFICATION_LUE" });
    } catch (error) {
        next(error);
    }
};

module.exports = { lister, marquerCommeLue };