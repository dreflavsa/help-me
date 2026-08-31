const express = require("express");

const router = express.Router();

const soumissionController = require("../controllers/soumissionControllers");
const correctionController = require("../controllers/correctionControllers");
const documentController = require("../controllers/documentControllers");
const uploadLogo = require("../config/logoMulterConfig");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const upload = require("../config/multerConfig");
const { createSoumissionSchema } = require("../validators/soumissionValidator");
const quotaMiddleware = require("../middlewares/quotaMiddleware");

router.post(
  "/",
  authMiddleware,
  upload.single("fichier"),
  validate(createSoumissionSchema),
  soumissionController.create,
);

router.get("/", authMiddleware, soumissionController.list);

router.get("/:id", authMiddleware, soumissionController.getOne);
router.post(
  "/:id/corriger",
  authMiddleware,
  quotaMiddleware,
  correctionController.corriger,
);

router.get(
  "/:id/correction",
  authMiddleware,
  correctionController.getCorrection,
);
router.post(
  "/:id/document",
  authMiddleware,
  uploadLogo.single("logo"),
  documentController.genererDocument,
);

module.exports = router;
