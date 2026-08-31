/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ArrowLeft, CheckCircle2, XCircle, Clock, Inbox } from "lucide-react";
import { getHistoriquePaiementsRequest } from "../api/adminApi";
import { Card } from "../components/ui/Card";

// Même logique de badge que sur la page des soumissions, adaptée
// aux 3 statuts possibles d'une demande de paiement.
const BADGES_STATUT = {
  EN_ATTENTE: {
    cle: "admin.statusPending",
    classe:
      "bg-surface-variant text-on-surface-variant border border-outline-variant/50",
    point: true,
  },
  VALIDE: {
    cle: "admin.statusValidated",
    classe: "bg-primary-fixed text-on-primary-fixed",
    Icone: CheckCircle2,
  },
  REFUSE: {
    cle: "admin.statusRefused",
    classe: "bg-error-container text-on-error-container",
    Icone: XCircle,
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
      {badge.Icone && <badge.Icone className="size-3.5" />}
      {t(badge.cle)}
    </span>
  );
}

const FILTRES = [
  { valeur: "", cle: "admin.filterAll" },
  { valeur: "EN_ATTENTE", cle: "admin.filterPending" },
  { valeur: "VALIDE", cle: "admin.filterValidated" },
  { valeur: "REFUSE", cle: "admin.filterRefused" },
];

export default function AdminHistoriquePaiementsPage() {
  const { t, i18n } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    getHistoriquePaiementsRequest(filtre)
      .then(({ data }) => setDemandes(data.data))
      .catch((error) =>
        setErreur(error.response?.data?.message || t("admin.loadHistoryError")),
      )
      .finally(() => setChargement(false));
  }, [filtre, t]);

  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="bg-background">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-10 py-8">
        <Link
          to="/admin/paiements"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("admin.backToPayments")}
        </Link>

        <h1 className="font-heading text-2xl font-bold text-primary mb-1">
          {t("admin.paymentsHistory")}
        </h1>
        <p className="text-on-surface-variant mb-6">
          {t("admin.pendingRequests", { count: demandes.length })}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
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

        {erreur && (
          <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container mb-6">
            {erreur}
          </div>
        )}

        {chargement ? (
          <p className="text-on-surface-variant">{t("common.loading")}</p>
        ) : demandes.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <Inbox className="size-6 mx-auto mb-2 text-on-surface-variant" />
            <p className="text-on-surface-variant">{t("admin.noHistoryYet")}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {demandes.map((d) => (
              <Card key={d.id} className="px-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-on-surface">
                        {d.prenom} {d.nom}
                      </h3>
                      <span className="text-xs text-on-surface-variant">
                        {d.email}
                      </span>
                    </div>
                    <Badge statut={d.statut} />
                  </div>

                  <p className="text-sm">
                    {t("admin.packLabel")}{" "}
                    <span className="font-semibold text-primary">{d.plan}</span>{" "}
                    — {d.montant} FCFA
                  </p>

                  <p className="text-sm text-on-surface-variant">
                    {t("admin.payerLabel")} : {d.numero_payeur} ·{" "}
                    {t("admin.refLabel")} :{" "}
                    <span className="font-mono">{d.reference_transaction}</span>
                  </p>

                  {d.statut === "REFUSE" && d.motif_refus && (
                    <p className="text-sm text-error">
                      {t("admin.refusalReason")} : {d.motif_refus}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-1 border-t border-outline-variant/50 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {t("admin.declaredOn")}{" "}
                      {new Date(d.date_declaration).toLocaleString(localeDate)}
                    </span>
                    {d.date_traitement && (
                      <span>
                        {t("admin.treatedOn")}{" "}
                        {new Date(d.date_traitement).toLocaleString(localeDate)}
                      </span>
                    )}
                    {d.admin_nom && (
                      <span>
                        {t("admin.treatedBy")} {d.admin_prenom} {d.admin_nom}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
