const dashboardService = require("../services/dashboardService");

const getDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getDashboard(req.user.sub);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
