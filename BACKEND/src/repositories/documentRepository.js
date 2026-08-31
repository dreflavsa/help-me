const pool = require("../database/database");

class DocumentRepository {
  // ==========================================================
  // DONNÉES NÉCESSAIRES À LA GÉNÉRATION DU DOCUMENT
  // ==========================================================

  async findDonneesPourDocument(soumissionId, utilisateurId) {
    const sql = `
      SELECT
        s.id AS soumission_id,
        s.titre,

        c.id AS correction_id,
        c.contenu,

        u.nom,
        u.prenom,
        u.matricule,

        fi.nom AS filiere,

        n.nom AS niveau,

        e.nom AS etablissement,

        m.nom AS matiere

      FROM soumissions s

      INNER JOIN corrections c
        ON c.soumission_id = s.id

      INNER JOIN utilisateurs u
        ON u.id = s.utilisateur_id

      LEFT JOIN filieres fi
        ON fi.id = u.filiere_id

      LEFT JOIN niveaux n
        ON n.id = u.niveau_id

      LEFT JOIN etablissements e
        ON e.id = fi.etablissement_id

      LEFT JOIN matieres m
        ON m.id = s.matiere_id

      WHERE s.id = ?
        AND s.utilisateur_id = ?

      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [soumissionId, utilisateurId]);

    return rows[0] || null;
  }

  // ==========================================================
  // DOCUMENT EXISTANT
  // ==========================================================

  async findDocumentByCorrectionId(correctionId) {
    const sql = `
      SELECT
        id,
        chemin,
        nom_fichier,
        taille

      FROM documents

      WHERE correction_id = ?

      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [correctionId]);

    return rows[0] || null;
  }

  // ==========================================================
  // CRÉATION DOCUMENT
  // ==========================================================

  async createDocument({ correctionId, nomFichier, chemin, taille }) {
    const sql = `
      INSERT INTO documents
      (
        correction_id,
        type_document,
        nom_fichier,
        chemin,
        taille
      )
      VALUES
      (
        ?,
        'DOCX',
        ?,
        ?,
        ?
      )
    `;

    const [result] = await pool.execute(sql, [
      correctionId,
      nomFichier,
      chemin,
      taille,
    ]);

    return result.insertId;
  }

  // ==========================================================
  // MISE À JOUR DOCUMENT
  // ==========================================================

  async updateDocument(id, { nomFichier, chemin, taille }) {
    const sql = `
      UPDATE documents

      SET
        nom_fichier = ?,
        chemin = ?,
        taille = ?,
        created_at = CURRENT_TIMESTAMP

      WHERE id = ?
    `;

    await pool.execute(sql, [nomFichier, chemin, taille, id]);
  }

  // ==========================================================
  // DOCUMENT POUR TÉLÉCHARGEMENT
  // ==========================================================

  async findDocumentPourTelechargement(documentId, utilisateurId) {
    const sql = `
      SELECT
        d.id,
        d.nom_fichier,
        d.chemin

      FROM documents d

      INNER JOIN corrections c
        ON c.id = d.correction_id

      INNER JOIN soumissions s
        ON s.id = c.soumission_id

      WHERE d.id = ?
        AND s.utilisateur_id = ?

      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [documentId, utilisateurId]);

    return rows[0] || null;
  }
}

module.exports = new DocumentRepository();
