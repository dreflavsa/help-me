const express = require("express");
const router = express.Router();

const paiementController = require("../controllers/paiementControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const { declarerPaiementSchema, refuserPaiementSchema } = require("../validators/paiementValidator");

// Côté étudiant
router.post(
    "/",
    authMiddleware,
    validateMiddleware(declarerPaiementSchema),
    paiementController.declarer,
);

// Côté admin  remplace "ADMIN" par le nom exact renvoyé par "SELECT * FROM roles;"
router.get(
    "/en-attente",
    authMiddleware,
    roleMiddleware("ADMIN"),
    paiementController.listerEnAttente,
);

router.get(
    "/historique",
    authMiddleware,
    roleMiddleware("ADMIN"),
    paiementController.historique,
);

router.post(
    "/:id/valider",
    authMiddleware,
    roleMiddleware("ADMIN"),
    paiementController.valider,
);

router.post(
    "/:id/refuser",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validateMiddleware(refuserPaiementSchema),
    paiementController.refuser,
);

module.exports = router;