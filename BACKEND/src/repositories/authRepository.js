const pool = require("../database/database");

class AuthRepository {
  async findUserByEmail(email) {
    const sql = `
            SELECT id, email
            FROM utilisateurs
            WHERE email = ?
            LIMIT 1
        `;

    const [rows] = await pool.execute(sql, [email]);

    return rows[0] || null;
  }

  async findEtablissementByName(nom) {
    const sql = `
        SELECT id, nom
        FROM etablissements
        WHERE LOWER(TRIM(nom)) = LOWER(TRIM(?))
        AND actif = 1
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [nom]);

    return rows[0] || null;
  }

  async createEtablissement(nom) {
    const sql = `
    INSERT INTO etablissements
    (
      nom,
      ville,
      actif
    )
    VALUES (?, ?, 1)
  `;

    const [result] = await pool.execute(sql, [nom.trim(), "Non renseignée"]);

    return result.insertId;
  }

  async findFiliereByName(nom, etablissementId) {
    const sql = `
        SELECT id, nom
        FROM filieres
        WHERE LOWER(TRIM(nom)) = LOWER(TRIM(?))
        AND etablissement_id = ?
        AND actif = 1
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [nom, etablissementId]);

    return rows[0] || null;
  }

  async createFiliere(nom, etablissementId) {
    const sql = `
    INSERT INTO filieres
    (
      nom,
      etablissement_id,
      actif
    )
    VALUES (?, ?, 1)
  `;

    const [result] = await pool.execute(sql, [nom.trim(), etablissementId]);

    return result.insertId;
  }

  async findNiveauById(niveauId) {
    const sql = `
            SELECT id
            FROM niveaux
            WHERE id = ?
            LIMIT 1
        `;

    const [rows] = await pool.execute(sql, [niveauId]);

    return rows[0] || null;
  }

  async createUser(user) {
    const sql = `
            INSERT INTO utilisateurs
            (
                role_id,
                nom,
                prenom,
                email,
                mot_de_passe,
                filiere_id,
                niveau_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

    const [result] = await pool.execute(sql, [
      2,
      user.nom,
      user.prenom,
      user.email,
      user.mot_de_passe,
      user.filiere_id,
      user.niveau_id,
    ]);

    return result.insertId;
  }

  async findUserForLogin(email) {
    const sql = `
        SELECT
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.mot_de_passe,
            u.role_id,
            r.nom AS role,
            u.est_verifie,
            u.deleted_at
        FROM utilisateurs u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.email = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [email]);

    return rows[0] || null;
  }

  async findUserById(userId) {
    const sql = `
        SELECT
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.role_id,
            r.nom AS role,
            u.deleted_at
        FROM utilisateurs u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [userId]);

    return rows[0] || null;
  }

  async saveRefreshToken(userId, tokenHash, expireLe) {
    const sql = `
        INSERT INTO refresh_tokens
        (
            utilisateur_id,
            token,
            expire_le
        )
        VALUES (?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [userId, tokenHash, expireLe]);

    return result.insertId;
  }

  async findRefreshTokenByHash(tokenHash) {
    const sql = `
        SELECT
            id,
            utilisateur_id,
            expire_le,
            est_revoque
        FROM refresh_tokens
        WHERE token = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [tokenHash]);

    return rows[0] || null;
  }

  async revokeRefreshTokenById(id) {
    const sql = `
        UPDATE refresh_tokens
        SET est_revoque = 1
        WHERE id = ?
    `;

    await pool.execute(sql, [id]);
  }

  async updateLastLogin(userId) {
    const sql = `
        UPDATE utilisateurs
        SET derniere_connexion = NOW()
        WHERE id = ?
    `;

    await pool.execute(sql, [userId]);
  }
}

module.exports = new AuthRepository();
