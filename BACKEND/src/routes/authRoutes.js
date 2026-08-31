const express = require("express");

const router = express.Router();

const authController = require("../controllers/authControllers");
const validate = require("../middlewares/validateMiddleware");

const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("../validators/authValidator");

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

module.exports = router;
