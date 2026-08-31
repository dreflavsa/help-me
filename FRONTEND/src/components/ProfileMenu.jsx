import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProfilRequest } from "../api/profilApi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfileMenu() {
  const { t } = useTranslation();
  const [profil, setProfil] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    getProfilRequest()
      .then(({ data }) => {
        if (!data?.data || !data.data.nom) {
          setErreur(t("profileMenu.emptyProfile"));
          return;
        }
        setProfil(data.data);
      })
      .catch((error) => {
        console.error("Erreur chargement profil :", error);
        setErreur(error.response?.data?.message || t("profileMenu.loadError"));
      })
      .finally(() => setChargement(false));
  }, [t]);

  useEffect(() => {
    const fermerSiExterieur = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };

    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, []);

  const initiales = profil
    ? `${profil.prenom?.[0] || ""}${profil.nom?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOuvert((o) => !o)}
        className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {initiales || <span className="material-symbols-outlined text-[20px]">person</span>}
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw_-_2rem)] bg-surface-container-lowest rounded-xl shadow-[0_12px_24px_-8px_rgba(30,39,97,0.18)] border border-outline-variant p-4 z-40">
          {chargement && <p className="text-sm text-on-surface-variant py-2">{t("profileMenu.loading")}</p>}

          {!chargement && erreur && <p className="text-sm text-error py-2">{erreur}</p>}

          {!chargement && !erreur && profil && (
            <>
              <div className="flex items-center gap-3 pb-3">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary font-semibold flex items-center justify-center text-lg shrink-0">
                  {initiales}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface truncate">{profil.prenom} {profil.nom}</p>
                  <p className="text-xs text-on-surface-variant truncate">{profil.email}</p>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t("profile.matricule")}</span>
                  <span className="text-on-surface font-medium">{profil.matricule || t("profile.notProvided")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t("auth.major")}</span>
                  <span className="text-on-surface font-medium">{profil.filiere}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t("auth.level")}</span>
                  <span className="text-on-surface font-medium">{profil.niveau}</span>
                </div>
              </div>

              <Link
                to="/profil"
                onClick={() => setOuvert(false)}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15 transition-colors"
              >
                {t("profileMenu.editProfile")}
              </Link>

              <button
                onClick={handleLogout}
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-error text-sm font-semibold hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                {t("navigation.logout")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}