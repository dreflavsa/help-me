// Usage : roleMiddleware("ADMIN") — accepte un ou plusieurs rôles autorisés.
// À placer TOUJOURS après authMiddleware (qui remplit req.user).
module.exports = (...rolesAutorises) => (req, res, next) => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            code: "ACCES_REFUSE",
            message: "Tu n'as pas les droits nécessaires pour accéder à cette ressource.",
        });
    }

    next();
};