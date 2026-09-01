import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SkeletonPage } from "../components/ui/Skeleton";

import {
  getPaiementsEnAttenteRequest,
  validerPaiementRequest,
  refuserPaiementRequest,
} from "../api/adminApi";
import { Card, CardContent } from "../components/ui/Card";

export default function AdminPaiementsPage() {
  const { t, i18n } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [enTraitement, setEnTraitement] = useState(null);
  const [motifRefus, setMotifRefus] = useState({});

  const charger = () => {
    getPaiementsEnAttenteRequest()
      .then(({ data }) => setDemandes(data.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const valider = async (id) => {
    setEnTraitement(id);
    try {
      await validerPaiementRequest(id);
      setDemandes((d) => d.filter((x) => x.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || t("admin.validateError"));
    } finally {
      setEnTraitement(null);
    }
  };

  const refuser = async (id) => {
    setEnTraitement(id);
    try {
      await refuserPaiementRequest(id, motifRefus[id] || "");
      setDemandes((d) => d.filter((x) => x.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || t("admin.refuseError"));
    } finally {
      setEnTraitement(null);
    }
  };

  const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";

  if (chargement) {
    return <SkeletonPage />;
  }

  return (
    <div className="bg-background">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-10 py-8">
        <Link
          to="/admin"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("admin.backToAdminDashboard")}
        </Link>

        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-heading text-2xl font-bold text-primary">
            {t("admin.paymentsToValidate")}
          </h1>
          <Link
            to="/admin/paiements/historique"
            className="text-sm font-semibold text-primary hover:underline shrink-0"
          >
            {t("admin.viewHistory")}
          </Link>
        </div>
        <p className="text-on-surface-variant mb-8">
          {t("admin.pendingRequests", { count: demandes.length })}
        </p>

        {demandes.length === 0 && (
          <Card className="px-6 py-10 text-center">
            <CardContent>
              <p className="text-on-surface-variant">
                {t("admin.noRequestsYet")}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {demandes.map((d) => (
            <Card key={d.id} className="px-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-on-surface">
                      {d.prenom} {d.nom}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                      <Clock className="size-3" />
                      {new Date(d.date_declaration).toLocaleString(localeDate)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{d.email}</p>
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
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-56 shrink-0">
                  <input
                    placeholder={t("admin.refusalReasonPlaceholder")}
                    value={motifRefus[d.id] || ""}
                    onChange={(e) =>
                      setMotifRefus((m) => ({ ...m, [d.id]: e.target.value }))
                    }
                    className="h-9 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => valider(d.id)}
                      disabled={enTraitement === d.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
                    >
                      <CheckCircle2 className="size-3.5" />
                      {t("admin.validate")}
                    </button>
                    <button
                      onClick={() => refuser(d.id)}
                      disabled={enTraitement === d.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-error-container py-2 text-xs font-semibold text-on-error-container hover:opacity-90 disabled:opacity-60"
                    >
                      <XCircle className="size-3.5" />
                      {t("admin.refuse")}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
