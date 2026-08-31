const pool = require("../database/database");

class SubscriptionRepository {
  async create({ utilisateurId, plan, creditsRestants, dateExpiration }) {
    const sql = `
            INSERT INTO subscriptions
            (utilisateur_id, plan, credits_restants, date_debut, date_expiration, statut)
            VALUES (?, ?, ?, NOW(), ?, 'ACTIF')
        `;

    const [result] = await pool.execute(sql, [
      utilisateurId,
      plan,
      creditsRestants,
      dateExpiration,
    ]);

    return result.insertId;
  }

  async findActiveByUtilisateur(utilisateurId) {
    const sql = `
            SELECT id, utilisateur_id, plan, credits_restants, date_debut, date_expiration, statut
            FROM subscriptions
            WHERE utilisateur_id = ?
            AND statut = 'ACTIF'
            ORDER BY id DESC
            LIMIT 1
        `;

    const [rows] = await pool.execute(sql, [utilisateurId]);

    return rows[0] || null;
  }

  async decrementerCredits(abonnementId) {
    const sql = `
            UPDATE subscriptions
            SET credits_restants = credits_restants - 1
            WHERE id = ?
            AND credits_restants IS NOT NULL
            AND credits_restants > 0
        `;

    await pool.execute(sql, [abonnementId]);
  }

  async changerPlan(abonnementId, plan, creditsRestants, dateExpiration) {
    const sql = `
            UPDATE subscriptions
            SET plan = ?, credits_restants = ?, date_debut = NOW(), date_expiration = ?
            WHERE id = ?
        `;

    await pool.execute(sql, [
      plan,
      creditsRestants,
      dateExpiration,
      abonnementId,
    ]);
  }
}

module.exports = new SubscriptionRepository();
