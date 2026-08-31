const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const soumissionRoutes = require("./routes/soumissionRoutes");
const documentRoutes = require("./routes/documentRoutes");
const profilRoutes = require("./routes/profilRoutes");
const referenceRoutes = require("./routes/referenceRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paiementRoutes = require("./routes/paiementRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "HELP ME API BY DREFLA.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/soumissions", soumissionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/profil", profilRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
