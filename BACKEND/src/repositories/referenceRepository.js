const pool = require("../database/database");

class ReferenceRepository {
    async findAllFilieres() {
        const sql = `SELECT id, nom FROM filieres WHERE actif = 1 ORDER BY nom`;

        const [rows] = await pool.execute(sql);

        return rows;
    }

    async findAllNiveaux() {
        const sql = `SELECT id, nom FROM niveaux WHERE actif = 1 ORDER BY ordre`;

        const [rows] = await pool.execute(sql);

        return rows;
    }
    async findAllMatieres() {
        const sql = `SELECT id, nom FROM matieres WHERE actif = 1 ORDER BY nom`;

        const [rows] = await pool.execute(sql);

        return rows;
    }
}

module.exports = new ReferenceRepository();
