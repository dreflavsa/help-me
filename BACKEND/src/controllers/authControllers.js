const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    if (!result.success) {
      const statusCodes = {
        EMAIL_ALREADY_EXISTS: 409,
        FILIERE_NOT_FOUND: 400,
        NIVEAU_NOT_FOUND: 400,
      };

      return res.status(statusCodes[result.code] || 400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    const result = await authService.login(email, mot_de_passe);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.logout(refreshToken);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
