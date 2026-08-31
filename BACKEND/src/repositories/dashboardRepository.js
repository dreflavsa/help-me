const pool = require("../database/database");

class DashboardRepository {
  async countTotalSoumissions(utilisateurId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM soumissions WHERE utilisateur_id = ?`,
      [utilisateurId],
    );
    return rows[0].total;
  }

  async countParStatut(utilisateurId) {
    const sql = `
            SELECT statut, COUNT(*) AS total
            FROM soumissions
            WHERE utilisateur_id = ?
            GROUP BY statut
        `;
    const [rows] = await pool.execute(sql, [utilisateurId]);
    return rows;
  }

  async moyenneNotes(utilisateurId) {
    const sql = `
            SELECT AVG(c.note) AS moyenne, COUNT(c.note) AS nombreNotes
            FROM corrections c
            INNER JOIN soumissions s ON s.id = c.soumission_id
            WHERE s.utilisateur_id = ?
              AND c.note IS NOT NULL
        `;
    const [rows] = await pool.execute(sql, [utilisateurId]);
    return rows[0];
  }

  async repartitionParMatiere(utilisateurId) {
    const sql = `
            SELECT m.nom AS matiere, COUNT(*) AS total
            FROM soumissions s
            INNER JOIN matieres m ON m.id = s.matiere_id
            WHERE s.utilisateur_id = ?
            GROUP BY m.id, m.nom
            ORDER BY total DESC
            LIMIT 5
        `;
    const [rows] = await pool.execute(sql, [utilisateurId]);
    return rows;
  }

  async soumissionsRecentes(utilisateurId) {
    const sql = `
            SELECT s.id, s.titre, s.statut, s.created_at, m.nom AS matiere
            FROM soumissions s
            INNER JOIN matieres m ON m.id = s.matiere_id
            WHERE s.utilisateur_id = ?
            ORDER BY s.created_at DESC
            LIMIT 5
        `;
    const [rows] = await pool.execute(sql, [utilisateurId]);
    return rows;
  }
}

module.exports = new DashboardRepository();
