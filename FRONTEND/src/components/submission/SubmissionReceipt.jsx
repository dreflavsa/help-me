import { useTranslation } from "react-i18next";
import { Check, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

function LigneTicket({ label, valeur, complet }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-2">
        {complet ? (
          <Check className="size-3.5 text-primary" strokeWidth={2.5} />
        ) : (
          <Circle className="size-3.5 text-on-surface-variant/40" />
        )}
        <span
          className={cn(
            "text-xs",
            complet ? "text-on-surface" : "text-on-surface-variant",
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn(
          "max-w-32 truncate text-right text-xs font-medium",
          complet ? "text-on-surface" : "text-on-surface-variant/60",
        )}
      >
        {valeur}
      </span>
    </div>
  );
}

export function SubmissionReceipt({
  titre,
  matiere,
  aDuContenu,
  nomFichier,
  pret,
}) {
  const { t } = useTranslation();

  return (
    <div className="relative rounded-xl bg-card p-4 pt-5 text-on-surface shadow-md ring-1 ring-outline-variant/70">
      <div className="tear-line absolute inset-x-4 top-0 h-px" />
      <p className="mb-2 text-center font-heading text-xs font-semibold tracking-[0.15em] text-on-surface-variant uppercase">
        {t("receipt.title")}
      </p>
      <div className="flex flex-col divide-y divide-outline-variant/70">
        <LigneTicket
          label={t("receipt.subjectLabel")}
          valeur={titre || "—"}
          complet={!!titre}
        />
        <LigneTicket
          label={t("receipt.matterLabel")}
          valeur={matiere || "—"}
          complet={!!matiere}
        />
        <LigneTicket
          label={t("receipt.contentLabel")}
          valeur={aDuContenu ? t("receipt.complete") : t("receipt.missing")}
          complet={aDuContenu}
        />
        <LigneTicket
          label={t("receipt.fileLabel")}
          valeur={nomFichier ?? t("receipt.none")}
          complet={!!nomFichier}
        />
      </div>
      <div
        className={cn(
          "mt-3 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
          pret
            ? "bg-primary/10 text-primary"
            : "bg-surface-container text-on-surface-variant",
        )}
      >
        {pret ? t("receipt.ready") : t("receipt.preparing")}
      </div>
    </div>
  );
}
