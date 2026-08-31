const pool = require("../database/database");

class CorrectionRepository {
    async findSoumissionForCorrection(id, utilisateurId) {
        const sql = `
            SELECT
                s.id, s.titre, s.consigne, s.statut,
                f.chemin AS fichier_chemin,
                f.type_mime AS fichier_mime,
                f.extension AS fichier_extension
            FROM soumissions s
            LEFT JOIN fichiers f ON f.soumission_id = s.id
            WHERE s.id = ?
              AND s.utilisateur_id = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [id, utilisateurId]);

        return rows[0] || null;
    }

    async updateSoumissionStatut(id, statut) {
        const sql = `
            UPDATE soumissions
            SET statut = ?
            WHERE id = ?
        `;

        await pool.execute(sql, [statut, id]);
    }

    async createCorrection({
        soumissionId,
        contenu,
        note,
        commentaire,
        dureeTraitement,
        modeleIA,
    }) {
        const sql = `
            INSERT INTO corrections
                (soumission_id, contenu, note, commentaire, duree_traitement, modele_ia)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            soumissionId,
            contenu,
            note,
            commentaire,
            dureeTraitement,
            modeleIA,
        ]);

        return result.insertId;
    }

    async findCorrectionBySoumissionId(soumissionId) {
        const sql = `
            SELECT id, soumission_id, contenu, note, commentaire, duree_traitement, modele_ia, created_at
            FROM corrections
            WHERE soumission_id = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [soumissionId]);

        return rows[0] || null;
    }
}

module.exports = new CorrectionRepository();
