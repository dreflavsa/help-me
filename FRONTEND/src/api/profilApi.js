import axiosClient from "./axiosClient";

export const getProfilRequest = () => axiosClient.get("/profil");

export const updateProfilRequest = (donnees) =>
  axiosClient.patch("/profil", donnees);
