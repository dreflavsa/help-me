const pool = require("../database/database");

class NotificationRepository {
  async create({ utilisateurId, typeNotificationId, titre, message }) {
    const sql = `
            INSERT INTO notifications
                (utilisateur_id, type_notification_id, titre, message)
            VALUES (?, ?, ?, ?)
        `;

    await pool.execute(sql, [
      utilisateurId,
      typeNotificationId,
      titre,
      message,
    ]);
  }

  async findByUtilisateur(utilisateurId) {
    const sql = `
            SELECT
                n.id, n.titre, n.message, n.est_lue, n.created_at,
                t.code AS type
            FROM notifications n
            INNER JOIN types_notifications t ON t.id = n.type_notification_id
            WHERE n.utilisateur_id = ?
            ORDER BY n.created_at DESC
            LIMIT 30
        `;

    const [rows] = await pool.execute(sql, [utilisateurId]);

    return rows;
  }

  async countNonLues(utilisateurId) {
    const sql = `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE utilisateur_id = ?
              AND est_lue = 0
        `;

    const [rows] = await pool.execute(sql, [utilisateurId]);

    return rows[0].total;
  }

  async marquerCommeLue(id, utilisateurId) {
    const sql = `
            UPDATE notifications
            SET est_lue = 1, date_lecture = NOW()
            WHERE id = ?
              AND utilisateur_id = ?
        `;

    await pool.execute(sql, [id, utilisateurId]);
  }
}

module.exports = new NotificationRepository();
