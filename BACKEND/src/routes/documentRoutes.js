const express = require("express");

const router = express.Router();

const documentController = require("../controllers/documentControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.get(
    "/:id/download",
    authMiddleware,
    documentController.telechargerDocument,
);

module.exports = router;
