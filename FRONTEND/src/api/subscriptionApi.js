import axiosClient from "./axiosClient";

export const getAbonnementRequest = () => axiosClient.get("/subscription");
