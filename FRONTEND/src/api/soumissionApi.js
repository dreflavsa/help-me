import axiosClient from "./axiosClient";

export const listerSoumissionsRequest = () => axiosClient.get("/soumissions");

export const getSoumissionRequest = (id) =>
  axiosClient.get(`/soumissions/${id}`);

export const creerSoumissionRequest = (donnees) => {
  const formData = new FormData();

  formData.append("titre", donnees.titre);
  formData.append("consigne", donnees.consigne || "");
  formData.append("matiere", donnees.matiere);

  if (donnees.fichier) {
    formData.append("fichier", donnees.fichier);
  }

  return axiosClient.post("/soumissions", formData);
};

export const corrigerSoumissionRequest = (id) =>
  axiosClient.post(`/soumissions/${id}/corriger`);

export const getCorrectionRequest = (id) =>
  axiosClient.get(`/soumissions/${id}/correction`);

export const genererDocumentRequest = (id, logo) => {
  const formData = new FormData();

  if (logo) {
    formData.append("logo", logo);
  }

  return axiosClient.post(`/soumissions/${id}/document`, formData);
};

export const telechargerDocumentRequest = (documentId) =>
  // responseType: "blob" est indispensable ici : sans lui, axios
  // essaierait de parser la réponse binaire comme du texte/JSON et
  // corromprait le fichier — l'équivalent, côté axios, du problème
  // qu'on avait débogué avec `curl -o` recevant du JSON par erreur.
  axiosClient.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
