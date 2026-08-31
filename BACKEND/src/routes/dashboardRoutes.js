const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, dashboardController.getDashboard);

module.exports = router;
