import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, PartyPopper, Send, Sparkles } from "lucide-react";

import { creerSoumissionRequest } from "../api/soumissionApi";

import { Button } from "../components/ui/Button";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../components/ui/Field";

import { FileDropzone } from "../components/submission/FileDropzone";
import { TipDeck } from "../components/submission/TipDeck";
import { SubmissionReceipt } from "../components/submission/SubmissionReceipt";

import { Card, CardContent } from "../components/ui/Card";

export default function NouvelleSoumissionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [matiere, setMatiere] = useState("");
  const [consigne, setConsigne] = useState("");
  const [fichier, setFichier] = useState(null);

  const [tente, setTente] = useState(false);
  const [statut, setStatut] = useState("idle");
  const [erreurServeur, setErreurServeur] = useState(null);

  const aDuContenu = consigne.trim().length > 0 || !!fichier;

  const ticketPret = titre.trim().length > 0 && !!matiere.trim() && aDuContenu;

  const erreurs = useMemo(() => {
    if (!tente) return {};

    return {
      titre: titre.trim() ? undefined : t("newSubmission.subjectTitleRequired"),
      matiere: matiere.trim()
        ? undefined
        : t("newSubmission.subjectMatterRequired"),
      contenu: aDuContenu ? undefined : t("newSubmission.contentRequired"),
    };
  }, [tente, titre, matiere, aDuContenu, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTente(true);
    setErreurServeur(null);

    if (!titre.trim() || !matiere.trim() || !aDuContenu) {
      return;
    }

    setStatut("envoi");

    try {
      const { data } = await creerSoumissionRequest({
        titre: titre.trim(),
        matiere: matiere.trim(),
        consigne,
        fichier,
      });

      setStatut("envoye");

      setTimeout(() => {
        navigate(`/soumissions/${data.data.id}`);
      }, 1200);
    } catch (error) {
      setErreurServeur(
        error.response?.data?.message || t("newSubmission.submissionError"),
      );
      setStatut("idle");
    }
  };

  if (statut === "envoye") {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-background px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex min-h-[420px] w-full items-center justify-center">
          <div className="notebook-holes flex w-full max-w-lg flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl bg-card p-6 text-center shadow-xl ring-1 ring-outline-variant/60 sm:p-10 sm:pl-14">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="size-8 text-primary" strokeWidth={1.75} />
            </div>

            <h2 className="font-heading text-xl font-semibold text-on-surface sm:text-2xl">
              {t("newSubmission.copySent")}
            </h2>

            <p className="w-full max-w-sm break-words text-sm leading-relaxed text-on-surface-variant">
              {t("newSubmission.copySentDescription", { titre })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Link
          to="/soumissions"
          className="mb-5 inline-flex max-w-full items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary sm:mb-6"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="truncate">
            {t("newSubmission.backToSubmissions")}
          </span>
        </Link>

        {erreurServeur && (
          <Card className="mb-6 w-full max-w-3xl overflow-hidden border-none bg-error-container py-4">
            <CardContent className="break-words px-4 text-sm text-on-error-container sm:px-6">
              {erreurServeur}
            </CardContent>
          </Card>
        )}

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-6">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="notebook-holes relative min-w-0 w-full overflow-hidden rounded-3xl bg-card p-5 pl-10 shadow-xl ring-1 ring-outline-variant/60 sm:p-8 sm:pl-16"
          >
            <span className="absolute right-4 top-4 hidden max-w-[calc(100%-2rem)] items-center gap-1 truncate rounded-full bg-accent px-3 py-1 text-xs font-medium text-on-accent sm:flex sm:right-6 sm:top-6">
              <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
              {t("newSubmission.aiCorrectionBadge")}
            </span>

            <div className="mb-5 flex sm:hidden">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-on-accent">
                <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
                {t("newSubmission.aiCorrectionBadge")}
              </span>
            </div>

            <FieldGroup className="min-w-0 gap-6">
              <Field className="min-w-0">
                <FieldLabel
                  htmlFor="titre"
                  className="font-heading text-base font-semibold text-on-surface"
                >
                  {t("newSubmission.subjectTitle")}
                </FieldLabel>

                <input
                  id="titre"
                  type="text"
                  placeholder={t("newSubmission.subjectTitlePlaceholder")}
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="h-11 w-full min-w-0 border-0 border-b-2 border-outline-variant bg-transparent px-1 text-base font-medium outline-none transition-colors focus:border-primary sm:text-lg"
                />

                {erreurs.titre && <FieldError>{erreurs.titre}</FieldError>}
              </Field>

              <Field className="max-w-64">
                <FieldLabel
                  htmlFor="matiere"
                  className="font-heading text-base font-semibold text-on-surface"
                >
                  {t("newSubmission.subjectMatter")}
                </FieldLabel>

                <input
                  id="matiere"
                  type="text"
                  placeholder={t("newSubmission.subjectMatterPlaceholder")}
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                  className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                />

                {erreurs.matiere && <FieldError>{erreurs.matiere}</FieldError>}
              </Field>

              <Field className="min-w-0">
                <FieldLabel
                  htmlFor="consigne"
                  className="font-heading text-base font-semibold text-on-surface"
                >
                  {t("newSubmission.instructionsLabel")}{" "}
                  <span className="font-sans text-xs font-normal text-on-surface-variant">
                    {t("newSubmission.instructionsOptional")}
                  </span>
                </FieldLabel>

                <textarea
                  id="consigne"
                  rows={6}
                  placeholder={t("newSubmission.instructionsPlaceholder")}
                  value={consigne}
                  onChange={(e) => setConsigne(e.target.value)}
                  className="ruled-paper block w-full min-w-0 max-w-full resize-none overflow-x-hidden bg-transparent px-1 text-sm leading-[28px] text-on-surface outline-none sm:text-base"
                />
              </Field>

              <Field className="min-w-0 max-w-full">
                <FieldLabel className="font-heading text-base font-semibold text-on-surface">
                  {t("newSubmission.attachedFile")}
                </FieldLabel>

                <div className="w-full min-w-0 max-w-full overflow-hidden">
                  <FileDropzone
                    fichier={fichier}
                    onFichierChange={setFichier}
                  />
                </div>
              </Field>

              {erreurs.contenu && (
                <FieldError className="-mt-2 break-words">
                  {erreurs.contenu}
                </FieldError>
              )}

              <div className="flex min-w-0 flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <FieldDescription className="hidden min-w-0 sm:block">
                  {t("newSubmission.checkReceipt")}
                </FieldDescription>

                <Button
                  type="submit"
                  size="lg"
                  disabled={statut === "envoi"}
                  className="w-full shrink-0 font-heading sm:w-auto"
                >
                  {statut === "envoi" ? (
                    t("newSubmission.sendingInProgress")
                  ) : (
                    <>
                      <Send className="size-4 shrink-0" />
                      {t("newSubmission.submitButton")}
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>

          <aside className="flex min-w-0 w-full flex-col gap-5 lg:sticky lg:top-20 lg:gap-6">
            <div className="min-w-0 w-full">
              <TipDeck />
            </div>

            <div className="min-w-0 w-full">
              <SubmissionReceipt
                titre={titre}
                matiere={matiere}
                aDuContenu={aDuContenu}
                nomFichier={fichier?.name ?? null}
                pret={ticketPret}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
