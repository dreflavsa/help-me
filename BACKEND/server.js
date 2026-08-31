require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/database/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await pool.getConnection();

        console.log("✅ Connexion MySQL réussie.");

        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Impossible de se connecter à MySQL.");
        console.error(error.message);

        process.exit(1);
    }
}

startServer();
