/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
} from "../api/authApi";
import { setAccessToken, setOnTokenExpired } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(null);
  // `chargementInitial` évite un "flash" vers l'écran de login le
  // temps que le silent refresh se termine au premier chargement.
  const [chargementInitial, setChargementInitial] = useState(true);

  const definirSession = (token, decoded) => {
    setAccessToken(token); // pour axiosClient (hors React), pas de re-render lié

    flushSync(() => {
      setAccessTokenState(token);
      setUser(decoded);
    });
  };

  const effacerSession = () => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    localStorage.removeItem("refreshToken");
  };

  // Décode la partie payload d'un JWT sans vérifier sa signature —
  // suffisant côté client puisqu'on ne fait QUE lire des infos
  // d'affichage (nom, role) ; la vraie vérification cryptographique
  // se fait côté serveur à chaque requête, jamais côté client.
  const decoderToken = (token) => {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  };

  const tenterRefresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      setChargementInitial(false);
      return;
    }

    try {
      const { data } = await refreshRequest(refreshToken);
      const decoded = decoderToken(data.data.accessToken);
      definirSession(data.data.accessToken, decoded);
    } catch (error) {
      effacerSession();
    } finally {
      setChargementInitial(false);
    }
  };

  // Au premier montage de l'app (rechargement de page inclus), on
  // tente de reconstruire la session à partir du refreshToken stocké.
  useEffect(() => {
    setOnTokenExpired(tenterRefresh);
    tenterRefresh();
  }, []);

  const login = async (email, mot_de_passe) => {
    const { data } = await loginRequest({ email, mot_de_passe });

    localStorage.setItem("refreshToken", data.data.refreshToken);

    const decoded = decoderToken(data.data.accessToken);

    definirSession(data.data.accessToken, decoded);

    return decoded;
  };

  const register = async (donnees) => {
    await registerRequest(donnees);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await logoutRequest(refreshToken).catch(() => {});
    }

    effacerSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        estConnecte: !!accessTokenState,
        chargementInitial,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
