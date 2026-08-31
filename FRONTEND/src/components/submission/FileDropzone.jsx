/* eslint-disable react-hooks/static-components */
import { useCallback, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { FieldDescription, FieldError } from "../ui/Field";

const EXTENSIONS_ACCEPTEES = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];
const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;

function formaterTaille(octets) {
  if (octets < 1024 * 1024) return `${Math.ceil(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

function iconePour(fichier) {
  return fichier.type.startsWith("image/") ? ImageIcon : FileText;
}

export function FileDropzone({ fichier, onFichierChange }) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef(null);
  const [survole, setSurvole] = useState(false);
  const [erreur, setErreur] = useState(null);

  const validerEtDefinir = useCallback(
    (candidat) => {
      if (!candidat) return;
      const extension = `.${candidat.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!EXTENSIONS_ACCEPTEES.includes(extension)) {
        setErreur(t("fileDropzone.formatError"));
        return;
      }
      if (candidat.size > TAILLE_MAX_OCTETS) {
        setErreur(
          t("fileDropzone.sizeError", {
            taille: formaterTaille(candidat.size),
          }),
        );
        return;
      }
      setErreur(null);
      onFichierChange(candidat);
    },
    [onFichierChange, t],
  );

  const Icone = fichier ? iconePour(fichier) : UploadCloud;

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvole(true);
        }}
        onDragLeave={() => setSurvole(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvole(false);
          validerEtDefinir(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container/40 px-4 py-6 text-center transition-all duration-200",
          survole && "scale-[1.01] border-primary bg-primary/10",
          fichier && "border-solid border-primary/40 bg-primary/5",
        )}
      >
        <Paperclip
          className={cn(
            "absolute -top-3 left-6 size-7 -rotate-[18deg] text-on-surface-variant/70 transition-transform duration-300",
            (survole || fichier) && "rotate-[8deg] text-primary",
          )}
          strokeWidth={1.75}
        />

        {!fichier ? (
          <>
            <Icone
              className="size-6 text-on-surface-variant"
              strokeWidth={1.75}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-on-surface">
                {t("fileDropzone.dragHere")}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("fileDropzone.or")}{" "}
                <label
                  htmlFor={inputId}
                  className="cursor-pointer font-medium text-primary underline underline-offset-2"
                >
                  {t("fileDropzone.browseFiles")}
                </label>
              </p>
            </div>
            <p className="text-[0.7rem] text-on-surface-variant/80">
              {t("fileDropzone.acceptedFormats")}
            </p>
          </>
        ) : (
          <div className="flex w-full items-center gap-3 rounded-lg bg-card px-3 py-2 text-left shadow-sm ring-1 ring-outline-variant/60">
            <Icone
              className="size-5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-on-surface">
                {fichier.name}
              </span>
              <span className="text-xs text-on-surface-variant">
                {formaterTaille(fichier.size)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("fileDropzone.removeFile")}
              onClick={() => {
                onFichierChange(null);
                setErreur(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={cn(
            "absolute inset-0 size-full cursor-pointer opacity-0",
            fichier && "pointer-events-none",
          )}
          accept={EXTENSIONS_ACCEPTEES.join(",")}
          aria-label={t("fileDropzone.ariaLabel")}
          onChange={(e) => validerEtDefinir(e.target.files?.[0])}
        />
      </div>

      {erreur ? (
        <FieldError>{erreur}</FieldError>
      ) : (
        <FieldDescription>{t("fileDropzone.optionalHint")}</FieldDescription>
      )}
    </div>
  );
}
