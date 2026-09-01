/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SkeletonList } from "../components/ui/Skeleton";

import {
  ArrowLeft,
  Cpu,
  CheckCircle2,
  XCircle,
  Coins,
  Inbox,
  Clock,
} from "lucide-react";
import { getStatsIARequest, listLogsIARequest } from "../api/adminApi";
import { Card, CardContent } from "../components/ui/Card";

function CarteStat({ Icone, label, valeur, tone }) {
  return (
    <Card className="min-w-0 py-3 sm:py-6">
      <CardContent className="flex min-w-0 items-start justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-on-surface-variant sm:text-sm">
            {label}
          </p>
          <p
            title={valeur}
            className="mt-1 truncate text-base font-semibold text-on-surface sm:mt-2 sm:text-2xl"
          >
            {valeur}
          </p>
        </div>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-11 sm:rounded-xl ${tone}`}
        >
          <Icone className="size-4 sm:size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
const BADGES_STATUT = {
  SUCCES: {
    cle: "admin.aiStatusSuccess",
    classe: "bg-primary-fixed text-on-primary-fixed",
    Icone: CheckCircle2,
  },
  ECHEC: {
    cle: "admin.aiStatusFailed",
    classe: "bg-error-container text-on-error-container",
    Icone: XCircle,
  },
};

function Badge({ statut }) {
  const { t } = useTranslation();
  const badge = BADGES_STATUT[statut] || BADGES_STATUT.SUCCES;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.classe}`}
    >
      <badge.Icone className="size-3.5" />
      {t(badge.cle)}
    </span>
  );
}

const FILTRES = [
  { valeur: "", cle: "admin.filterAll" },
  { valeur: "SUCCES", cle: "admin.filterSuccess" },
  { valeur: "ECHEC", cle: "admin.filterFailed" },
];

export default function AdminUsageIAPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    setErreur(null);
    getStatsIARequest()
      .then(({ data }) => setStats(data.data))
      .catch((error) =>
        setErreur(error.response?.data?.message || t("admin.loadAIStatsError")),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setChargement(true);
    listLogsIARequest(filtre)
      .then(({ data }) => setLogs(data.data))
      .catch((error) =>
        setErreur(error.response?.data?.message || t("admin.loadAIStatsError")),
      )
      .finally(() => setChargement(false));
  }, [filtre, t]);

  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";

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
          {t("admin.aiUsage")}
        </h1>
        <p className="text-on-surface-variant mb-6">
          {t("admin.aiUsageDescription")}
        </p>

        {erreur && (
          <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container mb-6">
            {erreur}
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-4">
              {" "}
              <CarteStat
                Icone={Cpu}
                label={t("admin.aiTotalCalls")}
                valeur={stats.global.totalAppels}
                tone="bg-primary/15 text-primary"
              />
              <CarteStat
                Icone={CheckCircle2}
                label={t("admin.aiSuccessCalls")}
                valeur={stats.global.totalSucces}
                tone="bg-secondary-container text-on-secondary-container"
              />
              <CarteStat
                Icone={XCircle}
                label={t("admin.aiFailedCalls")}
                valeur={stats.global.totalEchecs}
                tone="bg-error-container text-on-error-container"
              />
              <CarteStat
                Icone={Cpu}
                label={t("admin.aiTotalTokens")}
                valeur={stats.global.totalTokens.toLocaleString(localeDate)}
                tone="bg-accent text-on-accent"
              />
              <CarteStat
                Icone={Coins}
                label={t("admin.aiEstimatedCost")}
                valeur={`$${stats.global.coutTotalUsd.toFixed(4)}`}
                tone="bg-primary/10 text-primary"
              />
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant mt-6 mb-3">
              {t("admin.aiLast30Days")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
              {" "}
              <CarteStat
                Icone={Cpu}
                label={t("admin.aiCallsLast30")}
                valeur={stats.derniers30Jours.totalAppels}
                tone="bg-primary/15 text-primary"
              />
              <CarteStat
                Icone={Cpu}
                label={t("admin.aiTokensLast30")}
                valeur={stats.derniers30Jours.totalTokens.toLocaleString(
                  localeDate,
                )}
                tone="bg-accent text-on-accent"
              />
              <CarteStat
                Icone={Coins}
                label={t("admin.aiCostLast30")}
                valeur={`$${stats.derniers30Jours.coutTotalUsd.toFixed(4)}`}
                tone="bg-primary/10 text-primary"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            {t("admin.recentCalls")}
          </h2>
          <div className="flex gap-2">
            {FILTRES.map((f) => (
              <button
                key={f.valeur}
                onClick={() => setFiltre(f.valeur)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filtre === f.valeur
                    ? "bg-primary text-on-primary"
                    : "bg-surface-variant text-on-surface-variant hover:bg-surface-variant/70"
                }`}
              >
                {t(f.cle)}
              </button>
            ))}
          </div>
        </div>

        {chargement ? (
          <SkeletonList />
        ) : logs.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <Inbox className="size-6 mx-auto mb-2 text-on-surface-variant" />
            <p className="text-on-surface-variant">{t("admin.noLogsFound")}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <Card key={log.id} className="px-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">
                        {log.soumission_titre}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {log.prenom} {log.nom} · {log.email}
                      </p>
                    </div>
                    <Badge statut={log.statut} />
                  </div>

                  {log.statut === "SUCCES" ? (
                    <p className="text-sm text-on-surface-variant">
                      {log.tokens_total?.toLocaleString(localeDate)}{" "}
                      {t("admin.tokensLabel")}
                      {" · "}${Number(log.cout_estime_usd).toFixed(6)}
                      {" · "}
                      {t("admin.durationLabel")}{" "}
                      {(log.duree_ms / 1000).toFixed(1)}s
                    </p>
                  ) : (
                    <p className="text-sm text-error truncate">
                      {log.message_erreur}
                    </p>
                  )}

                  <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(log.created_at).toLocaleString(localeDate)} ·{" "}
                    {log.modele}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
