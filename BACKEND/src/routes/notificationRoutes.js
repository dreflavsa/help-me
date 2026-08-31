const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, notificationController.lister);
router.patch(
  "/:id/lue",
  authMiddleware,
  notificationController.marquerCommeLue,
);

module.exports = router;
