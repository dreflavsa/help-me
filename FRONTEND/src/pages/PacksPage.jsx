import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
  Check,
  Infinity as InfinityIcon,
  Phone,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { getAbonnementRequest } from "../api/subscriptionApi";
import { Card } from "../components/ui/Card";
import { declarerPaiementRequest } from "../api/paiementApi";

const NUMERO_ORANGE_MONEY = "693401863";

const PLANS_CONFIG = [
  { slug: "GRATUIT", prix: "0 FCFA", Icone: Sparkles },
  { slug: "STANDARD", prix: "1 500 FCFA", Icone: Zap },
  { slug: "PREMIUM", prix: "6 000 FCFA", Icone: Crown },
];

const CLE_PLAN = {
  GRATUIT: "plans.free",
  STANDARD: "plans.standard",
  PREMIUM: "plans.premium",
};

export default function PacksPage() {
  const { t } = useTranslation();

  const [abonnement, setAbonnement] = useState(null);
  const [chargement, setChargement] = useState(true);

  const [planEnDeclaration, setPlanEnDeclaration] = useState(null);
  const [formPaiement, setFormPaiement] = useState({
    numero_payeur: "",
    reference_transaction: "",
  });
  const [erreurPaiement, setErreurPaiement] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);

  useEffect(() => {
    getAbonnementRequest()
      .then(({ data }) => setAbonnement(data.data))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">{t("common.loading")}</p>
      </div>
    );
  }

  const PLANS = PLANS_CONFIG.map((p) => {
    const cle = p.slug.toLowerCase();
    return {
      ...p,
      nom: t(CLE_PLAN[p.slug]),
      sousTitre: t(`packs.${cle}Subtitle`),
      corrections: t(`packs.${cle}Corrections`),
      avantages: t(`packs.${cle}Features`, { returnObjects: true }),
    };
  });

  const planActuel = PLANS.find((p) => p.slug === abonnement.plan);
  const illimite = abonnement.credits_restants === null;
  const total =
    planActuel.slug === "STANDARD"
      ? 30
      : planActuel.slug === "GRATUIT"
        ? 5
        : null;
  const pourcentage =
    illimite || !total
      ? 100
      : Math.round(((total - abonnement.credits_restants) / total) * 100);

  const ouvrirDeclaration = (plan) => {
    setPlanEnDeclaration(plan);
    setErreurPaiement(null);
    setDemandeEnvoyee(false);
    setFormPaiement({ numero_payeur: "", reference_transaction: "" });
  };

  const soumettreDeclaration = async (e) => {
    e.preventDefault();
    setErreurPaiement(null);
    setEnvoiEnCours(true);

    try {
      await declarerPaiementRequest({
        plan: planEnDeclaration.slug,
        montant: Number(planEnDeclaration.prix.replace(/\D/g, "")),
        numero_payeur: formPaiement.numero_payeur,
        reference_transaction: formPaiement.reference_transaction,
      });
      setDemandeEnvoyee(true);
    } catch (error) {
      setErreurPaiement(
        error.response?.data?.message || t("packs.declarationError"),
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-8">
        <Link
          to="/"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("profile.backToDashboard")}
        </Link>

        <h1 className="font-heading text-3xl font-bold text-primary mb-2">
          {t("packs.title")}
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-xl">
          {t("packs.subtitle")}
        </p>

        {/* Bandeau abonnement actuel */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 shadow-md mb-10">
          <span className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface-variant">
                {t("packs.currentSubscription")}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="font-heading text-2xl font-bold text-on-surface">
                  {t("packs.packLabel")} {planActuel.nom}
                </h2>
                <span className="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  {t("packs.currentBadge")}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto sm:min-w-64">
              {illimite ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-accent/30 py-3">
                  <InfinityIcon className="size-5 text-on-surface" />
                  <span className="font-semibold text-on-surface">
                    {t("packs.unlimited")}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-on-surface">
                      {t("packs.creditsLeft", {
                        count: abonnement.credits_restants,
                      })}
                    </span>
                    <span className="text-on-surface-variant">
                      {t("packs.outOfMonth", { total })}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pourcentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cartes des 3 plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const estActuel = plan.slug === abonnement.plan;

            return (
              <Card
                key={plan.slug}
                className={`relative px-6 ${
                  estActuel
                    ? "border-2 border-primary shadow-lg"
                    : "border border-outline-variant"
                }`}
              >
                {estActuel && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-on-primary shadow-sm">
                    {t("packs.currentBadge")}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      estActuel
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    <plan.Icone className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-on-surface">
                      {plan.nom}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {plan.sousTitre}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-on-surface">
                    {plan.prix}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {t("packs.perMonth")}
                  </span>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {plan.corrections}
                  </p>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.avantages.map((avantage) => (
                    <li
                      key={avantage}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      <span className="text-on-surface">{avantage}</span>
                    </li>
                  ))}
                </ul>

                {estActuel ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-surface-container py-2.5 text-sm font-semibold text-on-surface-variant"
                  >
                    {t("packs.yourPlan")}
                  </button>
                ) : (
                  <button
                    onClick={() => ouvrirDeclaration(plan)}
                    className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
                  >
                    {t("packs.switchToPlan")}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {planEnDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md px-6 py-6 max-h-[90vh] overflow-y-auto">
            {!demandeEnvoyee ? (
              <>
                <h3 className="font-heading text-xl font-bold text-on-surface mb-1">
                  {t("packs.switchToPlanModal", { nom: planEnDeclaration.nom })}
                </h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  {t("packs.amountToPay")}{" "}
                  <span className="font-semibold text-primary">
                    {planEnDeclaration.prix}
                  </span>
                </p>

                <div className="rounded-xl bg-surface-container p-4 mb-5 text-sm space-y-1">
                  <p className="font-semibold text-on-surface">
                    {t("packs.instructions")}
                  </p>
                  <p className="text-on-surface-variant">
                    1.{" "}
                    {t("packs.instructionStep1", {
                      montant: planEnDeclaration.prix,
                    })}{" "}
                    <span className="font-semibold text-on-surface">
                      {NUMERO_ORANGE_MONEY}
                    </span>
                  </p>
                  <p className="text-on-surface-variant">
                    2. {t("packs.instructionStep2")}
                  </p>
                  <p className="text-on-surface-variant">
                    3. {t("packs.instructionStep3")}
                  </p>
                </div>

                {erreurPaiement && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-sm">
                    {erreurPaiement}
                  </div>
                )}

                <form onSubmit={soumettreDeclaration} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-on-surface mb-1 block">
                      {t("packs.yourOrangeMoneyNumber")}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input
                        required
                        placeholder="6XX XXX XXX"
                        value={formPaiement.numero_payeur}
                        onChange={(e) =>
                          setFormPaiement((f) => ({
                            ...f,
                            numero_payeur: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-3 h-11 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-on-surface mb-1 block">
                      {t("packs.transactionReference")}
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input
                        required
                        placeholder="Ex. OM-2026-XXXXXXXX"
                        value={formPaiement.reference_transaction}
                        onChange={(e) =>
                          setFormPaiement((f) => ({
                            ...f,
                            reference_transaction: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-3 h-11 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPlanEnDeclaration(null)}
                      className="flex-1 rounded-xl border border-outline-variant py-2.5 text-sm font-semibold text-on-surface-variant"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={envoiEnCours}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
                    >
                      {envoiEnCours ? t("packs.sending") : t("packs.send")}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="size-12 text-primary mx-auto mb-3" />
                <h3 className="font-heading text-xl font-bold text-on-surface mb-2">
                  {t("packs.requestSent")}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  {t("packs.requestSentDescription")}
                </p>
                <button
                  onClick={() => setPlanEnDeclaration(null)}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary"
                >
                  {t("common.close")}
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
