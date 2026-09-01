import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SkeletonPage } from "../components/ui/Skeleton";
import {
  ClipboardList,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
  FileText,
  ChevronRight,
  Gift,
  Zap,
  Crown,
} from "lucide-react";
import { getDashboardRequest } from "../api/dashboardApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { getAbonnementRequest } from "../api/subscriptionApi";

const COULEUR_STATUT = {
  EN_ATTENTE: "bg-outline",
  EN_COURS: "bg-secondary",
  TERMINEE: "bg-primary",
  ECHEC: "bg-error",
  ANNULEE: "bg-outline-variant",
};

const CLE_PLAN = {
  GRATUIT: "plans.free",
  STANDARD: "plans.standard",
  PREMIUM: "plans.premium",
};

const STYLE_PLAN = {
  GRATUIT: { Icone: Gift, tone: "bg-surface-variant text-on-surface-variant" },
  STANDARD: {
    Icone: Zap,
    tone: "bg-secondary-container text-on-secondary-container",
  },
  PREMIUM: { Icone: Crown, tone: "bg-accent text-on-accent" },
};

function CarteStat({ icone: Icone, valeur, label, tone }) {
  return (
    <Card className="min-w-0 w-full overflow-hidden">
      <CardContent className="flex min-w-0 items-start justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
        <div className="min-w-0 flex-1">
          <p className="break-words text-xs leading-tight text-on-surface-variant sm:text-sm">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            {valeur}
          </p>
        </div>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone} sm:size-10 lg:size-11`}
        >
          <Icone className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();

  const [dashboard, setDashboard] = useState(null);
  const [abonnement, setAbonnement] = useState(null);

  useEffect(() => {
    getDashboardRequest().then(({ data }) => setDashboard(data.data));
    getAbonnementRequest().then(({ data }) => setAbonnement(data.data));
  }, []);

  const LIBELLE_STATUT = {
    EN_ATTENTE: t("dashboard.status.pending"),
    EN_COURS: t("dashboard.status.inProgress"),
    TERMINEE: t("dashboard.status.completed"),
    ECHEC: t("dashboard.status.failed"),
    ANNULEE: t("dashboard.status.cancelled"),
  };

  if (!dashboard) {
    return <SkeletonPage />;
  }

  const { totalSoumissions, parStatut, moyenneNotes, parMatiere, recentes } =
    dashboard;

  const maxMatiere = Math.max(...parMatiere.map((m) => m.total), 1);
  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background">
      <div className="mx-auto w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
        {/* En-tête */}
        <div className="mb-6 min-w-0 sm:mb-8">
          <h1 className="text-2xl font-bold text-primary">
            {t("dashboard.title")}
          </h1>

          {abonnement && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/50 bg-gradient-to-r from-primary/12 via-primary/5 to-transparent px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${STYLE_PLAN[abonnement.plan].tone}`}
                >
                  {(() => {
                    const IconePlan = STYLE_PLAN[abonnement.plan].Icone;
                    return <IconePlan className="size-5" />;
                  })()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {t(CLE_PLAN[abonnement.plan])}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {abonnement.credits_restants === null
                      ? t("dashboard.unlimitedCorrections")
                      : t("dashboard.creditsRemaining", {
                          count: abonnement.credits_restants,
                        })}
                  </p>
                </div>
              </div>

              {abonnement.plan !== "PREMIUM" && (
                <Link
                  to="/packs"
                  className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary transition-transform hover:scale-105"
                >
                  {t("dashboard.upgrade")}
                </Link>
              )}
            </div>
          )}

          <p className="mt-1 break-words text-sm text-on-surface-variant sm:text-base">
            {t("dashboard.overview")}
          </p>
        </div>

        <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <CarteStat
            icone={ClipboardList}
            valeur={totalSoumissions}
            label={t("dashboard.totalSubmissions")}
            tone="bg-primary/15 text-primary"
          />

          <CarteStat
            icone={CheckCircle2}
            valeur={parStatut.TERMINEE}
            label={t("dashboard.completedCorrections")}
            tone="bg-secondary-container text-on-secondary-container"
          />

          <CarteStat
            icone={CircleDashed}
            valeur={parStatut.EN_COURS}
            label={t("dashboard.inProgress")}
            tone="bg-accent text-on-accent"
          />

          <CarteStat
            icone={TrendingUp}
            valeur={moyenneNotes !== null ? `${moyenneNotes}/20` : "—"}
            label={t("dashboard.averageGrade")}
            tone="bg-primary/10 text-primary"
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Répartition par statut */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>{t("dashboard.statusBreakdown")}</CardTitle>
            </CardHeader>

            <CardContent className="min-w-0 px-4 sm:px-6">
              <div className="flex min-w-0 flex-col gap-4">
                {Object.entries(parStatut)
                  .filter(([, total]) => total > 0)
                  .map(([statut, total]) => (
                    <div key={statut} className="min-w-0">
                      <div className="mb-1 flex min-w-0 items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words text-on-surface-variant">
                          {LIBELLE_STATUT[statut]}
                        </span>

                        <span className="shrink-0 font-medium text-on-surface">
                          {total}
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={`h-full rounded-full ${COULEUR_STATUT[statut]} transition-all duration-500`}
                          style={{
                            width: `${(total / totalSoumissions) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                {totalSoumissions === 0 && (
                  <p className="text-sm text-on-surface-variant">
                    {t("dashboard.noSubmissionsYet")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Répartition par matière */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>{t("dashboard.topSubjects")}</CardTitle>
            </CardHeader>

            <CardContent className="min-w-0 px-4 sm:px-6">
              <div className="flex min-w-0 flex-col gap-4">
                {parMatiere.map((m) => (
                  <div key={m.matiere} className="min-w-0">
                    <div className="mb-1 flex min-w-0 items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 break-words text-on-surface-variant">
                        {m.matiere}
                      </span>

                      <span className="shrink-0 font-medium text-on-surface">
                        {m.total}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                      <div
                        className="h-full rounded-full bg-primary-container transition-all duration-500"
                        style={{
                          width: `${(m.total / maxMatiere) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                {parMatiere.length === 0 && (
                  <p className="text-sm text-on-surface-variant">
                    {t("dashboard.nothingToShow")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 min-w-0 overflow-hidden sm:mt-6">
          <CardHeader className="flex-row items-center justify-between gap-3 px-4 sm:px-6">
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>

            <Link
              to="/soumissions"
              className="hidden shrink-0 items-center text-sm text-primary hover:underline sm:flex"
            >
              {t("dashboard.viewAll")}
              <ChevronRight className="size-4" />
            </Link>
          </CardHeader>

          <CardContent className="min-w-0 px-3 sm:px-6">
            <div className="flex min-w-0 flex-col gap-1">
              {recentes.map((s) => (
                <Link
                  key={s.id}
                  to={`/soumissions/${s.id}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-variant/60 sm:gap-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container sm:size-10">
                    <FileText className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">
                      {s.titre}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                      {s.matiere}
                    </p>
                  </div>

                  <span className="hidden shrink-0 text-xs text-outline min-[400px]:block">
                    {new Date(s.created_at).toLocaleDateString(localeDate)}
                  </span>
                </Link>
              ))}

              {recentes.length === 0 && (
                <p className="px-3 py-2 text-sm text-on-surface-variant">
                  {t("dashboard.noRecentActivity")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
