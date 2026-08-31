const express = require("express");

const router = express.Router();

const referenceController = require("../controllers/referenceControllers");

// Pas de authMiddleware ici, volontairement — cf. Décision 1.
router.get("/filieres", referenceController.getFilieres);
router.get("/niveaux", referenceController.getNiveaux);
router.get("/matieres", referenceController.getMatieres);

module.exports = router;
