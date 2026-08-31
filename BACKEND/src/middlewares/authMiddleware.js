const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                success: false,
                code: "TOKEN_MISSING",
                message: "Token d'authentification manquant.",
            });
        }

        const parts = authorization.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
            return res.status(401).json({
                success: false,
                code: "INVALID_AUTH_HEADER",
                message: "Format du token invalide.",
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                code: "TOKEN_EXPIRED",
                message: "Votre session a expiré.",
            });
        }

        return res.status(401).json({
            success: false,
            code: "INVALID_TOKEN",
            message: "Token d'authentification invalide.",
        });
    }
};

module.exports = authMiddleware;
