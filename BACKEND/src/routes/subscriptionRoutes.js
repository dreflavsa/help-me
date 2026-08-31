const express = require("express");
const router = express.Router();

const subscriptionController = require("../controllers/subscriptionControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, subscriptionController.getMonAbonnement);

module.exports = router;