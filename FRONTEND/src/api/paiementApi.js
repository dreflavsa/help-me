import axiosClient from "./axiosClient";

export const declarerPaiementRequest = (donnees) =>
  axiosClient.post("/paiements", donnees);
