const express = require("express");

const router = express.Router();

const profilController = require("../controllers/profilControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { updateProfilSchema } = require("../validators/profilValidator");

router.get("/", authMiddleware, profilController.getProfil);

router.patch(
    "/",
    authMiddleware,
    validate(updateProfilSchema),
    profilController.updateProfil,
);

module.exports = router;
