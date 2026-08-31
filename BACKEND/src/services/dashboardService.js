const dashboardRepository = require("../repositories/dashboardRepository");

class DashboardService {
  async getDashboard(utilisateurId) {
    // Toutes ces requêtes sont indépendantes les unes des autres —
    // les lancer en parallèle réduit nettement le temps de réponse
    // par rapport à 5 `await` successifs.
    const [total, parStatut, notes, parMatiere, recentes] = await Promise.all([
      dashboardRepository.countTotalSoumissions(utilisateurId),
      dashboardRepository.countParStatut(utilisateurId),
      dashboardRepository.moyenneNotes(utilisateurId),
      dashboardRepository.repartitionParMatiere(utilisateurId),
      dashboardRepository.soumissionsRecentes(utilisateurId),
    ]);

    // On transforme le tableau brut [{statut, total}, ...] en objet
    // {EN_ATTENTE: 2, TERMINEE: 5, ...} avec toutes les clés à 0 par
    // défaut — plus simple à consommer côté frontend qu'un tableau
    // où un statut absent doit être interprété comme "zéro".
    const statuts = {
      EN_ATTENTE: 0,
      EN_COURS: 0,
      TERMINEE: 0,
      ECHEC: 0,
      ANNULEE: 0,
    };
    parStatut.forEach((ligne) => {
      statuts[ligne.statut] = ligne.total;
    });

    return {
      success: true,
      data: {
        totalSoumissions: total,
        parStatut: statuts,
        moyenneNotes: notes.moyenne ? Number(notes.moyenne).toFixed(1) : null,
        nombreCorrectionsNotees: notes.nombreNotes,
        parMatiere,
        recentes,
      },
    };
  }
}

module.exports = new DashboardService();
