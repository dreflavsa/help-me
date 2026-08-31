import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  CreditCard,
  FileText,
  Clock,
  TrendingUp,
  ShieldCheck,
  Cpu,
} from "lucide-react";

import { getStatsAdminRequest, getRevenusRequest } from "../api/adminApi";
import { Card, CardContent } from "../components/ui/Card";

function CarteStat({ Icone, label, valeur, tone }) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-on-surface-variant">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-on-surface">
            {valeur}
          </p>
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icone className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
function GraphiqueRevenus({ donnees }) {
  const { t, i18n } = useTranslation();
  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";
  const max = Math.max(...donnees.map((d) => d.total), 1);

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
          {t("admin.monthlyRevenue")}
        </h2>
        <div className="flex items-end gap-1.5 sm:gap-2 h-40">
          {donnees.map((d) => {
            const hauteur = Math.max((d.total / max) * 100, 2);
            const label = new Date(`${d.mois}-01`).toLocaleDateString(
              localeDate,
              {
                month: "short",
              },
            );

            return (
              <div
                key={d.mois}
                className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0"
                title={`${label} : ${d.total.toLocaleString(localeDate)} FCFA`}
              >
                <div
                  className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${hauteur}%` }}
                />
                <span className="text-[10px] text-on-surface-variant truncate w-full text-center">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [revenus, setRevenus] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const chargerStats = async () => {
      try {
        setErreur(null);
        const { data } = await getStatsAdminRequest();
        setStats(data.data);
      } catch (error) {
        console.error("Erreur chargement statistiques admin :", error);
        setErreur(error.response?.data?.message || t("admin.loadStatsError"));
      }
    };

    const chargerRevenus = async () => {
      try {
        const { data } = await getRevenusRequest();
        setRevenus(data.data);
      } catch (error) {
        console.error("Erreur chargement revenus :", error);
        // Pas de setErreur ici : un échec sur le graphique de revenus ne
        // doit pas bloquer l'affichage du reste du dashboard.
      }
    };

    chargerStats();
    chargerRevenus();
  }, [t]);
  if (erreur) {
    return (
      <div className="w-full min-w-0 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
          <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
            {erreur}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <p className="text-on-surface-variant">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
        <div className="mb-6 min-w-0 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold text-primary">
                {t("admin.dashboardTitle")}
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
                {t("admin.dashboardSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {stats.paiements.enAttente > 0 && (
          <Link
            to="/admin/paiements"
            className="mb-6 flex min-w-0 items-center justify-between gap-4 rounded-xl bg-accent/30 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Clock className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 break-words font-medium text-on-surface">
                {t("admin.pendingPayments", {
                  count: stats.paiements.enAttente,
                })}
              </span>
            </div>
            <span className="shrink-0 font-semibold text-primary">
              {t("admin.viewLink")}
            </span>
          </Link>
        )}

        {revenus && (
          <section className="mt-8">
            <GraphiqueRevenus donnees={revenus} />
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            {t("admin.management")}
          </h2>

          <div className="grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4">
            <CarteStat
              Icone={Users}
              label={t("admin.users")}
              valeur={stats.utilisateurs.total}
              tone="bg-primary/15 text-primary"
            />
            <CarteStat
              Icone={Users}
              label={t("admin.students")}
              valeur={stats.utilisateurs.etudiants}
              tone="bg-secondary-container text-on-secondary-container"
            />
            <CarteStat
              Icone={CreditCard}
              label={t("admin.activePacks")}
              valeur={stats.packsActifs}
              tone="bg-accent text-on-accent"
            />
            <CarteStat
              Icone={Clock}
              label={t("admin.pendingPaymentsLabel")}
              valeur={stats.paiements.enAttente}
              tone="bg-error-container text-on-error-container"
            />
            <CarteStat
              Icone={TrendingUp}
              label={t("admin.totalRevenue")}
              valeur={`${stats.paiements.montantTotal} FCFA`}
              tone="bg-primary/10 text-primary"
            />
            <CarteStat
              Icone={CreditCard}
              label={t("admin.validatedPayments")}
              valeur={stats.paiements.valides}
              tone="bg-secondary-container text-on-secondary-container"
            />
            <CarteStat
              Icone={FileText}
              label={t("admin.completedCorrections")}
              valeur={stats.soumissions.terminees}
              tone="bg-primary/15 text-primary"
            />
            <CarteStat
              Icone={FileText}
              label={t("admin.documentsGenerated")}
              valeur={stats.documentsGeneres}
              tone="bg-accent text-on-accent"
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            {t("admin.management")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/admin/paiements" className="group">
              <Card className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <CreditCard className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface">
                      {t("admin.paymentManagement")}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {t("admin.paymentManagementDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/utilisateurs" className="group">
              <Card className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                    <Users className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface">
                      {t("admin.userManagement")}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {t("admin.userManagementDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/usage-ia" className="group">
              <Card className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent">
                    <Cpu className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface">
                      {t("admin.aiUsage")}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {t("admin.aiUsageDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
