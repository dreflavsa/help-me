import axiosClient from "./axiosClient";

export const registerRequest = (donnees) =>
    axiosClient.post("/auth/register", donnees);

export const loginRequest = (donnees) =>
    axiosClient.post("/auth/login", donnees);

export const refreshRequest = (refreshToken) =>
    axiosClient.post("/auth/refresh", { refreshToken });

export const logoutRequest = (refreshToken) =>
    axiosClient.post("/auth/logout", { refreshToken });

export const getFilieresRequest = () => axiosClient.get("/reference/filieres");

export const getNiveauxRequest = () => axiosClient.get("/reference/niveaux");
export const getMatieresRequest = () => axiosClient.get("/reference/matieres");
