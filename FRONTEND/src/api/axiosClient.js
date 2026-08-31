import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Cette variable et ces fonctions permettent à AuthContext de "brancher"
// l'accessToken courant sur axios, sans qu'axiosClient ait besoin de
// connaître React ou le contexte — on garde ce fichier indépendant.
let accessToken = null;
let onTokenExpired = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setOnTokenExpired = (callback) => {
  onTokenExpired = callback;
};

// Intercepteur de REQUÊTE : ajoute automatiquement le header
// Authorization sur CHAQUE appel, sans avoir à l'écrire à chaque fois
// dans authApi.js, soumissionApi.js, etc.
axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Intercepteur de RÉPONSE : si le serveur renvoie TOKEN_EXPIRED (401),
// on prévient AuthContext plutôt que de laisser chaque composant gérer
// individuellement l'expiration du token.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code;

    if (code === "TOKEN_EXPIRED" && onTokenExpired) {
      onTokenExpired();
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
