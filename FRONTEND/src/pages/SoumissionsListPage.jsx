import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SkeletonList } from "../components/ui/Skeleton";
/* eslint-disable no-unused-vars */
import {
  Plus,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  Inbox,
} from "lucide-react";
import { listerSoumissionsRequest } from "../api/soumissionApi";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";

// Un badge par statut : couleur, icône, et clé de traduction —
// centralisé ici pour ne pas répéter cette logique dans le JSX.
const BADGES_STATUT = {
  EN_ATTENTE: {
    cle: "submissions.statusPending",
    classe:
      "bg-surface-variant text-on-surface-variant border border-outline-variant/50",
    point: true,
  },
  EN_COURS: {
    cle: "submissions.statusInProgress",
    classe: "bg-secondary-container text-on-secondary-container",
    Icone: RefreshCw,
    anime: true,
  },
  TERMINEE: {
    cle: "submissions.statusCompleted",
    classe: "bg-primary-fixed text-on-primary-fixed",
    Icone: CheckCircle2,
  },
  ECHEC: {
    cle: "submissions.statusFailed",
    classe: "bg-error-container text-on-error-container",
    Icone: XCircle,
  },
  ANNULEE: {
    cle: "submissions.statusCancelled",
    classe:
      "bg-surface-variant text-on-surface-variant border border-outline-variant/50",
    Icone: Ban,
  },
};

function Badge({ statut }) {
  const { t } = useTranslation();
  const badge = BADGES_STATUT[statut] || BADGES_STATUT.EN_ATTENTE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.classe}`}
    >
      {badge.point && <span className="w-2 h-2 rounded-full bg-outline" />}
      {badge.Icone && (
        <badge.Icone
          className={`size-3.5 ${badge.anime ? "animate-spin" : ""}`}
        />
      )}
      {t(badge.cle)}
    </span>
  );
}

export default function SoumissionsListPage() {
  const { t, i18n } = useTranslation();
  const [soumissions, setSoumissions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listerSoumissionsRequest()
      .then(({ data }) => setSoumissions(data.data))
      .finally(() => setChargement(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="bg-background">
      <div className="w-full px-6 md:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {t("submissions.title")}
            </h1>
            <p className="text-on-surface-variant mt-1">
              {t("submissions.subtitle")}
            </p>
          </div>

          <Link
            to="/soumissions/nouvelle"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="size-4" />
            {t("navigation.newSubmission")}
          </Link>
        </div>

        {chargement && <SkeletonList />}

        {!chargement && soumissions.length === 0 && (
          <Card className="items-center text-center py-12 gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Inbox className="size-6" />
            </div>
            <p className="text-on-surface-variant">
              {t("submissions.emptyState")}
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {soumissions.map((s) => (
            <Link key={s.id} to={`/soumissions/${s.id}`}>
              <Card className="flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 px-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {s.titre}
                  </h3>
                  <p className="text-on-surface-variant mt-1 flex items-center gap-2 text-sm">
                    <BookOpen className="size-4 text-outline" />
                    {s.matiere}
                  </p>
                  <p className="text-xs text-outline mt-3">
                    {t("submissions.submittedOn")}{" "}
                    {new Date(s.created_at).toLocaleDateString(localeDate)}
                  </p>
                </div>

                <Badge statut={s.statut} />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
