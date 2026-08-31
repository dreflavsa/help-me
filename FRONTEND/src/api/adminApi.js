import axiosClient from "./axiosClient";

export const getPaiementsEnAttenteRequest = () =>
  axiosClient.get("/paiements/en-attente");
export const getHistoriquePaiementsRequest = (statut) =>
  axiosClient.get("/paiements/historique", {
    params: statut ? { statut } : {},
  });
export const validerPaiementRequest = (id) =>
  axiosClient.post(`/paiements/${id}/valider`);
export const refuserPaiementRequest = (id, motif) =>
  axiosClient.post(`/paiements/${id}/refuser`, { motif });
export const getStatsAdminRequest = () => axiosClient.get("/admin/stats");
export const getRevenusRequest = () => axiosClient.get("/admin/revenus");
export const listUsersRequest = (filtres) =>
  axiosClient.get("/admin/utilisateurs", { params: filtres });
export const desactiverUtilisateurRequest = (id) =>
  axiosClient.post(`/admin/utilisateurs/${id}/desactiver`);
export const reactiverUtilisateurRequest = (id) =>
  axiosClient.post(`/admin/utilisateurs/${id}/reactiver`);
export const getStatsIARequest = () => axiosClient.get("/admin/logs-ia/stats");
export const listLogsIARequest = (statut) =>
  axiosClient.get("/admin/logs-ia", { params: statut ? { statut } : {} });
