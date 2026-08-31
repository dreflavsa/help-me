const pool = require("../database/database");

// Tarif approximatif Gemini, en USD pour 1000 tokens — à ajuster si le
// modèle configuré dans GEMINI_MODEL a une grille tarifaire différente.
// Sert uniquement d'ESTIMATION affichée à l'admin, pas d'une facturation réelle.
const TARIF_USD_PAR_1000_TOKENS_PROMPT = 0.00015;
const TARIF_USD_PAR_1000_TOKENS_REPONSE = 0.0006;

function estimerCout({ tokensPrompt, tokensReponse }) {
  const coutPrompt = (tokensPrompt / 1000) * TARIF_USD_PAR_1000_TOKENS_PROMPT;
  const coutReponse =
    (tokensReponse / 1000) * TARIF_USD_PAR_1000_TOKENS_REPONSE;
  return Number((coutPrompt + coutReponse).toFixed(6));
}

class LogIaRepository {
  async enregistrerSucces({
    utilisateurId,
    soumissionId,
    modele,
    usage,
    dureeMs,
  }) {
    const coutEstime = estimerCout(usage);

    await pool.execute(
      `INSERT INTO logs_ia
                (utilisateur_id, soumission_id, statut, modele, tokens_prompt, tokens_reponse, tokens_total, cout_estime_usd, duree_ms)
             VALUES (?, ?, 'SUCCES', ?, ?, ?, ?, ?, ?)`,
      [
        utilisateurId,
        soumissionId,
        modele,
        usage.tokensPrompt,
        usage.tokensReponse,
        usage.tokensTotal,
        coutEstime,
        dureeMs,
      ],
    );
  }

  async enregistrerEchec({
    utilisateurId,
    soumissionId,
    modele,
    dureeMs,
    messageErreur,
  }) {
    await pool.execute(
      `INSERT INTO logs_ia
                (utilisateur_id, soumission_id, statut, modele, duree_ms, message_erreur)
             VALUES (?, ?, 'ECHEC', ?, ?, ?)`,
      [
        utilisateurId,
        soumissionId,
        modele,
        dureeMs,
        (messageErreur || "").slice(0, 500),
      ],
    );
  }

  async getStats() {
    const [[globales]] = await pool.query(`
            SELECT
                COUNT(*) AS total_appels,
                SUM(statut = 'SUCCES') AS total_succes,
                SUM(statut = 'ECHEC') AS total_echecs,
                COALESCE(SUM(tokens_total), 0) AS total_tokens,
                COALESCE(SUM(cout_estime_usd), 0) AS cout_total_usd
            FROM logs_ia
        `);

    const [[periode30j]] = await pool.query(`
            SELECT
                COUNT(*) AS total_appels,
                COALESCE(SUM(tokens_total), 0) AS total_tokens,
                COALESCE(SUM(cout_estime_usd), 0) AS cout_total_usd
            FROM logs_ia
            WHERE created_at >= NOW() - INTERVAL 30 DAY
        `);

    return {
      global: {
        totalAppels: globales.total_appels,
        totalSucces: globales.total_succes || 0,
        totalEchecs: globales.total_echecs || 0,
        totalTokens: globales.total_tokens,
        coutTotalUsd: Number(globales.cout_total_usd),
      },
      derniers30Jours: {
        totalAppels: periode30j.total_appels,
        totalTokens: periode30j.total_tokens,
        coutTotalUsd: Number(periode30j.cout_total_usd),
      },
    };
  }

  async listerRecents({ statut, limite = 100 } = {}) {
    const conditions = [];
    const params = [];

    if (statut) {
      conditions.push("l.statut = ?");
      params.push(statut);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sql = `
            SELECT
                l.id, l.statut, l.modele, l.tokens_prompt, l.tokens_reponse, l.tokens_total,
                l.cout_estime_usd, l.duree_ms, l.message_erreur, l.created_at,
                u.nom, u.prenom, u.email,
                s.titre AS soumission_titre
            FROM logs_ia l
            INNER JOIN utilisateurs u ON u.id = l.utilisateur_id
            INNER JOIN soumissions s ON s.id = l.soumission_id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT ?
        `;

    const [rows] = await pool.query(sql, [...params, limite]);
    return rows;
  }
}

module.exports = new LogIaRepository();
