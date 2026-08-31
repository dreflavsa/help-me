const pool = require("../database/database");

class ProfilRepository {
    async findProfilById(userId) {
        const sql = `
            SELECT
                u.id, u.nom, u.prenom, u.email, u.matricule, u.telephone,
                u.est_verifie, u.derniere_connexion,
                f.id AS filiere_id, f.nom AS filiere,
                n.id AS niveau_id, n.nom AS niveau
            FROM utilisateurs u
            INNER JOIN filieres f ON f.id = u.filiere_id
            INNER JOIN niveaux n ON n.id = u.niveau_id
            WHERE u.id = ?
              AND u.deleted_at IS NULL
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [userId]);

        return rows[0] || null;
    }

    async findUserByMatricule(matricule) {
        const sql = `
            SELECT id
            FROM utilisateurs
            WHERE matricule = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [matricule]);

        return rows[0] || null;
    }

    async updateProfil(userId, champs) {
        // On construit la requête UPDATE dynamiquement : seuls les champs
        // réellement fournis dans le body (donc présents dans `champs`)
        // sont mis à jour. Sans ça, un simple `UPDATE ... SET nom=?,
        // prenom=?, ...` écraserait avec `undefined`/`null` tous les
        // champs que l'étudiant n'a pas voulu modifier.
        const colonnes = Object.keys(champs);

        if (colonnes.length === 0) {
            return;
        }

        const setClause = colonnes.map((col) => `${col} = ?`).join(", ");
        const valeurs = colonnes.map((col) => champs[col]);

        const sql = `UPDATE utilisateurs SET ${setClause} WHERE id = ?`;

        await pool.execute(sql, [...valeurs, userId]);
    }
}

module.exports = new ProfilRepository();
