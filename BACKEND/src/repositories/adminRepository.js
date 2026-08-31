const pool = require("../database/database");

class AdminRepository {
  async getStatsGenerales() {
    const [[utilisateurs]] = await pool.query(`
            SELECT
                COUNT(*) AS total,
                SUM(r.nom = 'ETUDIANT') AS etudiants,
                SUM(r.nom = 'ADMIN') AS admins
            FROM utilisateurs u
            INNER JOIN roles r ON r.id = u.role_id
        `);

    const [[packs]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM subscriptions
            WHERE statut = 'ACTIF' AND plan != 'GRATUIT'
        `);

    const [[paiements]] = await pool.query(`
            SELECT
                SUM(statut = 'EN_ATTENTE') AS en_attente,
                SUM(statut = 'VALIDE') AS valides,
                SUM(statut = 'REFUSE') AS refuses,
                COALESCE(SUM(CASE WHEN statut = 'VALIDE' THEN montant ELSE 0 END), 0) AS montant_total
            FROM demandes_paiement
        `);

    const [[soumissions]] = await pool.query(`
            SELECT
                COUNT(*) AS total,
                SUM(statut = 'TERMINEE') AS terminees
            FROM soumissions
        `);

    const [[documents]] = await pool.query(`
            SELECT COUNT(*) AS total FROM documents
        `);

    return {
      utilisateurs: {
        total: utilisateurs.total,
        etudiants: utilisateurs.etudiants || 0,
        admins: utilisateurs.admins || 0,
      },
      packsActifs: packs.total,
      paiements: {
        enAttente: paiements.en_attente || 0,
        valides: paiements.valides || 0,
        refuses: paiements.refuses || 0,
        montantTotal: paiements.montant_total || 0,
      },
      soumissions: {
        total: soumissions.total,
        terminees: soumissions.terminees || 0,
      },
      documentsGeneres: documents.total,
    };
  }
  async getRevenusParMois() {
    const [rows] = await pool.query(`
            SELECT DATE_FORMAT(date_traitement, '%Y-%m') AS mois, SUM(montant) AS total
            FROM demandes_paiement
            WHERE statut = 'VALIDE'
              AND date_traitement >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY mois
            ORDER BY mois
        `);

    // On complète les mois sans paiement validé par un total à 0, pour
    // afficher les 12 derniers mois en continu plutôt que de sauter
    // les mois "vides" (aucun paiement validé ce mois-là).
    const totauxParMois = new Map(rows.map((r) => [r.mois, Number(r.total)]));
    const resultat = [];
    const aujourdHui = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        aujourdHui.getFullYear(),
        aujourdHui.getMonth() - i,
        1,
      );
      const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      resultat.push({ mois: cle, total: totauxParMois.get(cle) || 0 });
    }

    return resultat;
  }
  async listUsers({ recherche, role, statut } = {}) {
    const conditions = [];
    const params = [];

    if (recherche) {
      conditions.push(
        "(u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ? OR u.matricule LIKE ?)",
      );
      const motif = `%${recherche}%`;
      params.push(motif, motif, motif, motif);
    }

    if (role) {
      conditions.push("r.nom = ?");
      params.push(role);
    }

    if (statut === "ACTIF") {
      conditions.push("u.deleted_at IS NULL");
    } else if (statut === "INACTIF") {
      conditions.push("u.deleted_at IS NOT NULL");
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sql = `
            SELECT
                u.id, u.nom, u.prenom, u.email, u.matricule, u.telephone,
                u.est_verifie, u.derniere_connexion, u.created_at, u.deleted_at,
                r.nom AS role,
                f.nom AS filiere,
                n.nom AS niveau
            FROM utilisateurs u
            INNER JOIN roles r ON r.id = u.role_id
            INNER JOIN filieres f ON f.id = u.filiere_id
            INNER JOIN niveaux n ON n.id = u.niveau_id
            ${whereClause}
            ORDER BY u.created_at DESC
        `;

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async setActif(userId, actif) {
    const sql = actif
      ? `UPDATE utilisateurs SET deleted_at = NULL WHERE id = ?`
      : `UPDATE utilisateurs SET deleted_at = NOW() WHERE id = ?`;

    const [result] = await pool.execute(sql, [userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new AdminRepository();
