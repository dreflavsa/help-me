import axiosClient from "./axiosClient";

export const getDashboardRequest = () => axiosClient.get("/dashboard");