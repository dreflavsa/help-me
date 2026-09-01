/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SkeletonPage } from "../components/ui/Skeleton";

import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileText,
  Image,
  Download,
} from "lucide-react";
import {
  getSoumissionRequest,
  corrigerSoumissionRequest,
  getCorrectionRequest,
  genererDocumentRequest,
  telechargerDocumentRequest,
} from "../api/soumissionApi";
import { Card, CardContent } from "../components/ui/Card";

export default function SoumissionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const inputLogoRef = useRef(null);

  const [soumission, setSoumission] = useState(null);
  const [correction, setCorrection] = useState(null);
  const [enCorrection, setEnCorrection] = useState(false);
  const [logo, setLogo] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [genererEnCours, setGenererEnCours] = useState(false);
  const [erreurChargement, setErreurChargement] = useState(null);

  const CONFIG_STATUT = {
    EN_ATTENTE: {
      label: t("submissions.statusPending"),
      classe: "bg-surface-variant text-on-surface-variant",
    },
    EN_COURS: {
      label: t("submissions.statusInProgress"),
      classe: "bg-secondary-container text-on-secondary-container",
    },
    TERMINEE: {
      label: t("submissions.statusCompleted"),
      classe: "bg-primary-fixed text-on-primary-fixed",
    },
    ECHEC: {
      label: t("submissions.statusFailed"),
      classe: "bg-error-container text-on-error-container",
    },
  };

  const chargerSoumission = useCallback(async () => {
    try {
      const { data } = await getSoumissionRequest(id);
      setSoumission(data.data);
      return data.data;
    } catch (error) {
      setErreurChargement(
        error.response?.data?.message || t("submissionDetail.loadError"),
      );
      return null;
    }
  }, [id, t]);

  useEffect(() => {
    chargerSoumission();
  }, [chargerSoumission]);

  useEffect(() => {
    getCorrectionRequest(id)
      .then(({ data }) => setCorrection(data.data))
      .catch(() => {});
  }, [id]);

  const attendreCorrection = async () => {
    const MAX_TENTATIVES = 20;

    for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const soumissionActuelle = await chargerSoumission();

      if (soumissionActuelle.statut === "TERMINEE") {
        const { data } = await getCorrectionRequest(id);
        setCorrection(data.data);
        setEnCorrection(false);
        return;
      }

      if (soumissionActuelle.statut === "ECHEC") {
        setErreur(t("submissionDetail.correctionFailedRetry"));
        setEnCorrection(false);
        return;
      }
    }

    setErreur(t("submissionDetail.correctionTimeout"));
    setEnCorrection(false);
  };

  const lancerCorrection = async () => {
    setErreur(null);
    setEnCorrection(true);

    try {
      await corrigerSoumissionRequest(id);
      await attendreCorrection();
    } catch (error) {
      setErreur(
        error.response?.data?.message || t("submissionDetail.correctionError"),
      );
      setEnCorrection(false);
    }
  };

  const genererDocument = async () => {
    setErreur(null);
    setGenererEnCours(true);

    try {
      const { data } = await genererDocumentRequest(id, logo);
      const reponse = await telechargerDocumentRequest(data.data.id);

      const url = window.URL.createObjectURL(new Blob([reponse.data]));
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `correction-${soumission.titre}.docx`;
      lien.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErreur(
        error.response?.data?.message || t("submissionDetail.documentError"),
      );
    } finally {
      setGenererEnCours(false);
    }
  };

  if (!soumission) {
    if (erreurChargement) {
      return (
        <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center px-6">
          <p className="text-on-surface-variant">{erreurChargement}</p>
        </div>
      );
    }

    return <SkeletonPage />;
  }

  const statutInfo =
    CONFIG_STATUT[soumission.statut] || CONFIG_STATUT.EN_ATTENTE;

  return (
    <div className="bg-background">
      <div className="w-full px-6 md:px-10 py-8">
        <Link
          to="/soumissions"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("newSubmission.backToSubmissions")}
        </Link>

        {erreur && (
          <Card className="mb-6 py-4 bg-error-container border-none max-w-3xl">
            <CardContent className="text-sm text-on-error-container">
              {erreur}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="px-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-primary">
                  {soumission.titre}
                </h1>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statutInfo.classe}`}
                >
                  {statutInfo.label}
                </span>
              </div>
              <p className="text-on-surface-variant text-sm flex items-center gap-2">
                <BookOpen className="size-4" />
                {soumission.matiere}
              </p>
              {soumission.consigne && (
                <p className="text-on-surface mt-4 whitespace-pre-line">
                  {soumission.consigne}
                </p>
              )}
            </Card>

            {!correction &&
              soumission.statut !== "EN_COURS" &&
              !enCorrection && (
                <Card className="px-6 items-center text-center">
                  <Sparkles className="size-9 text-primary mx-auto" />
                  <p className="text-on-surface-variant mt-2 mb-4">
                    {soumission.statut === "ECHEC"
                      ? t("submissionDetail.lastAttemptFailed")
                      : t("submissionDetail.notCorrectedYet")}
                  </p>
                  <button
                    onClick={lancerCorrection}
                    className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="size-4" />
                    {t("submissionDetail.launchCorrection")}
                  </button>
                </Card>
              )}

            {(enCorrection || soumission.statut === "EN_COURS") && (
              <Card className="px-6 items-center text-center">
                <RefreshCw className="size-9 text-secondary animate-spin mx-auto" />
                <p className="text-on-surface-variant mt-2">
                  {t("submissionDetail.correctionInProgress")}
                </p>
              </Card>
            )}

            {correction && (
              <Card className="px-6">
                <h2 className="font-semibold text-primary flex items-center gap-2 mb-4">
                  <CheckCircle2 className="size-5" />
                  {t("submissionDetail.correctionSection")}
                </h2>
                <p className="text-on-surface whitespace-pre-line leading-relaxed">
                  {correction.contenu}
                </p>
              </Card>
            )}
          </div>

          {correction && (
            <Card className="px-6 lg:sticky lg:top-8">
              <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
                <FileText className="size-5" />
                {t("submissionDetail.wordDocument")}
              </h3>

              <label className="block text-sm font-semibold text-on-surface mb-2">
                {t("submissionDetail.logoOptional")}
              </label>

              <div
                onClick={() => inputLogoRef.current?.click()}
                className="border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors mb-4"
              >
                <input
                  ref={inputLogoRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setLogo(e.target.files[0] || null)}
                  className="hidden"
                />

                {logo ? (
                  <p className="text-sm text-on-surface flex items-center justify-center gap-2">
                    <Image className="size-4 text-primary" />
                    {logo.name}
                  </p>
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    {t("submissionDetail.clickToAddLogo")}
                  </p>
                )}
              </div>

              <button
                onClick={genererDocument}
                disabled={genererEnCours}
                className="w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Download className="size-4" />
                {genererEnCours
                  ? t("submissionDetail.generating")
                  : t("submissionDetail.generateAndDownload")}
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
