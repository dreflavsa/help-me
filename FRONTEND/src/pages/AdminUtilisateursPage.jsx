/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Search, UserCheck, UserX } from "lucide-react";
import { SkeletonList } from "../components/ui/Skeleton";
import {
  listUsersRequest,
  desactiverUtilisateurRequest,
  reactiverUtilisateurRequest,
} from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";

export default function AdminUtilisateursPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enTraitement, setEnTraitement] = useState(null);

  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [role, setRole] = useState("");
  const [statut, setStatut] = useState("");

  const charger = () => {
    setChargement(true);
    setErreur(null);
    listUsersRequest({ recherche, role, statut })
      .then(({ data }) => setUtilisateurs(data.data))
      .catch((error) =>
        setErreur(error.response?.data?.message || t("admin.loadUsersError")),
      )
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche, role, statut]);

  const lancerRecherche = (e) => {
    e.preventDefault();
    setRecherche(rechercheSaisie.trim());
  };

  const desactiver = async (id) => {
    setEnTraitement(id);
    try {
      await desactiverUtilisateurRequest(id);
      setUtilisateurs((liste) =>
        liste.map((u) =>
          u.id === id ? { ...u, deleted_at: new Date().toISOString() } : u,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || t("admin.actionError"));
    } finally {
      setEnTraitement(null);
    }
  };

  const reactiver = async (id) => {
    setEnTraitement(id);
    try {
      await reactiverUtilisateurRequest(id);
      setUtilisateurs((liste) =>
        liste.map((u) => (u.id === id ? { ...u, deleted_at: null } : u)),
      );
    } catch (error) {
      alert(error.response?.data?.message || t("admin.actionError"));
    } finally {
      setEnTraitement(null);
    }
  };

  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";
  const selectStyle =
    "h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary";

  return (
    <div className="bg-background">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-10 py-8">
        <Link
          to="/admin"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("admin.backToAdminDashboard")}
        </Link>

        <h1 className="font-heading text-2xl font-bold text-primary mb-1">
          {t("admin.userManagement")}
        </h1>
        <p className="text-on-surface-variant mb-6">
          {t("admin.userManagementDescription")}
        </p>

        <form
          onSubmit={lancerRecherche}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
            <input
              value={rechercheSaisie}
              onChange={(e) => setRechercheSaisie(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={selectStyle}
          >
            <option value="">{t("admin.roleAll")}</option>
            <option value="ETUDIANT">{t("admin.roleStudent")}</option>
            <option value="ADMIN">{t("admin.roleAdmin")}</option>
          </select>

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className={selectStyle}
          >
            <option value="">{t("admin.accountStatusAll")}</option>
            <option value="ACTIF">{t("admin.accountActive")}</option>
            <option value="INACTIF">{t("admin.accountInactive")}</option>
          </select>

          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
          >
            {t("admin.search")}
          </button>
        </form>

        {erreur && (
          <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container mb-6">
            {erreur}
          </div>
        )}

        {chargement ? (
          <SkeletonList />
        ) : utilisateurs.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="text-on-surface-variant">{t("admin.noUsersFound")}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {utilisateurs.map((u) => {
              const estActif = !u.deleted_at;
              const estSoiMeme = u.id === user?.sub;

              return (
                <Card key={u.id} className="px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-on-surface">
                          {u.prenom} {u.nom}
                        </h3>
                        {estSoiMeme && (
                          <span className="text-xs text-on-surface-variant">
                            {t("admin.you")}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-variant text-on-surface-variant"
                          }`}
                        >
                          {u.role === "ADMIN"
                            ? t("admin.roleAdmin")
                            : t("admin.roleStudent")}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            estActif
                              ? "bg-primary-fixed text-on-primary-fixed"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {estActif
                            ? t("admin.accountActive")
                            : t("admin.accountInactive")}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {u.email}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {u.filiere} · {u.niveau}
                        {u.matricule &&
                          ` · ${t("admin.matriculeLabel")} ${u.matricule}`}
                        {u.telephone && ` · ${u.telephone}`}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {t("admin.registeredOn")}{" "}
                        {new Date(u.created_at).toLocaleDateString(localeDate)}
                      </p>
                    </div>

                    {!estSoiMeme && (
                      <button
                        onClick={() =>
                          estActif ? desactiver(u.id) : reactiver(u.id)
                        }
                        disabled={enTraitement === u.id}
                        className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shrink-0 hover:opacity-90 disabled:opacity-60 ${
                          estActif
                            ? "bg-error-container text-on-error-container"
                            : "bg-primary text-on-primary"
                        }`}
                      >
                        {estActif ? (
                          <>
                            <UserX className="size-3.5" />
                            {t("admin.deactivate")}
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-3.5" />
                            {t("admin.reactivate")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
