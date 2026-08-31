const pool = require("../database/database");

class PaiementRepository {
  async create({ utilisateurId, plan, montant, numeroPayeur, reference }) {
    const sql = `
            INSERT INTO demandes_paiement
            (utilisateur_id, plan, montant, numero_payeur, reference_transaction)
            VALUES (?, ?, ?, ?, ?)
        `;

    const [result] = await pool.execute(sql, [
      utilisateurId,
      plan,
      montant,
      numeroPayeur,
      reference,
    ]);

    return result.insertId;
  }

  async findByReference(reference) {
    const sql = `SELECT id FROM demandes_paiement WHERE reference_transaction = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [reference]);
    return rows[0] || null;
  }

  async findById(id) {
    const sql = `
            SELECT id, utilisateur_id, plan, montant, numero_payeur,
                   reference_transaction, statut, admin_id, date_declaration
            FROM demandes_paiement
            WHERE id = ?
            LIMIT 1
        `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findEnAttente() {
    const sql = `
            SELECT dp.id, dp.plan, dp.montant, dp.numero_payeur,
                   dp.reference_transaction, dp.date_declaration,
                   u.id AS utilisateur_id, u.nom, u.prenom, u.email
            FROM demandes_paiement dp
            INNER JOIN utilisateurs u ON u.id = dp.utilisateur_id
            WHERE dp.statut = 'EN_ATTENTE'
            ORDER BY dp.date_declaration ASC
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async findHistorique({ statut } = {}) {
    let sql = `
            SELECT dp.id, dp.plan, dp.montant, dp.numero_payeur,
                   dp.reference_transaction, dp.statut, dp.motif_refus,
                   dp.date_declaration, dp.date_traitement,
                   u.nom, u.prenom, u.email,
                   a.nom AS admin_nom, a.prenom AS admin_prenom
            FROM demandes_paiement dp
            INNER JOIN utilisateurs u ON u.id = dp.utilisateur_id
            LEFT JOIN utilisateurs a ON a.id = dp.admin_id
        `;
    const params = [];

    if (statut) {
      sql += ` WHERE dp.statut = ?`;
      params.push(statut);
    }

    sql += ` ORDER BY dp.date_declaration DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async updateStatut(id, statut, adminId, motifRefus = null) {
    const sql = `
            UPDATE demandes_paiement
            SET statut = ?, admin_id = ?, motif_refus = ?, date_traitement = NOW()
            WHERE id = ?
        `;
    await pool.execute(sql, [statut, adminId, motifRefus, id]);
  }
}

module.exports = new PaiementRepository();
