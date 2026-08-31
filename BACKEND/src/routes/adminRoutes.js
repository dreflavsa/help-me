const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.getStats,
);
router.get(
  "/revenus",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.getRevenus,
);
router.get(
  "/utilisateurs",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.listUsers,
);
router.post(
  "/utilisateurs/:id/desactiver",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.desactiverUtilisateur,
);
router.post(
  "/utilisateurs/:id/reactiver",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.reactiverUtilisateur,
);
router.get(
  "/logs-ia/stats",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.getStatsIA,
);
router.get(
  "/logs-ia",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminController.listLogsIA,
);

module.exports = router;
