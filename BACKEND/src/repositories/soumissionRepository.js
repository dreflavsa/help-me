const pool = require("../database/database");

class SoumissionRepository {
  async findMatiereByName(nom, filiereId, niveauId) {
    const sql = `
        SELECT id, nom
        FROM matieres
        WHERE LOWER(TRIM(nom)) = LOWER(TRIM(?))
        AND filiere_id = ?
        AND niveau_id = ?
        AND actif = 1
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [nom, filiereId, niveauId]);

    return rows[0] || null;
  }

  // Ajouter :
  async createMatiere(nom, filiereId, niveauId) {
    const sql = `
        INSERT INTO matieres
        (
            filiere_id,
            niveau_id,
            nom,
            actif
        )
        VALUES (?, ?, ?, 1)
    `;

    const [result] = await pool.execute(sql, [filiereId, niveauId, nom.trim()]);

    return result.insertId;
  }

  async createSoumission({
    utilisateurId,
    matiereId,
    titre,
    consigne,
    fichier,
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [soumissionResult] = await connection.execute(
        `INSERT INTO soumissions
                    (utilisateur_id, matiere_id, titre, consigne, statut)
                 VALUES (?, ?, ?, ?, 'EN_ATTENTE')`,
        [utilisateurId, matiereId, titre, consigne || null],
      );

      const soumissionId = soumissionResult.insertId;

      if (fichier) {
        await connection.execute(
          `INSERT INTO fichiers
                        (soumission_id, nom_original, nom_stockage, chemin, type_mime, extension, taille)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            soumissionId,
            fichier.originalname,
            fichier.filename,
            fichier.path,
            fichier.mimetype,
            fichier.extension,
            fichier.size,
          ],
        );
      }

      await connection.commit();

      return soumissionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUtilisateur(utilisateurId) {
    const sql = `
            SELECT
                s.id, s.titre, s.consigne, s.statut, s.created_at,
                m.nom AS matiere,
                f.nom_original AS fichier_nom
            FROM soumissions s
            INNER JOIN matieres m ON m.id = s.matiere_id
            LEFT JOIN fichiers f ON f.soumission_id = s.id
            WHERE s.utilisateur_id = ?
            ORDER BY s.created_at DESC
        `;

    const [rows] = await pool.execute(sql, [utilisateurId]);

    return rows;
  }

  async findByIdAndUtilisateur(id, utilisateurId) {
    const sql = `
            SELECT
                s.id, s.titre, s.consigne, s.statut, s.created_at,
                m.nom AS matiere,
                f.nom_original AS fichier_nom, f.chemin AS fichier_chemin
            FROM soumissions s
            INNER JOIN matieres m ON m.id = s.matiere_id
            LEFT JOIN fichiers f ON f.soumission_id = s.id
            WHERE s.id = ?
              AND s.utilisateur_id = ?
            LIMIT 1
        `;

    const [rows] = await pool.execute(sql, [id, utilisateurId]);

    return rows[0] || null;
  }
}

module.exports = new SoumissionRepository();
