import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

const ROTATIONS = [-3, 2, -2, 3, 0];
const PALETTES = [
  "bg-accent text-on-accent",
  "bg-secondary text-on-secondary",
  "bg-card text-on-surface ring-1 ring-outline-variant",
  "bg-accent text-on-accent",
  "bg-secondary text-on-secondary",
];

export function TipDeck() {
  const { t } = useTranslation();
  const conseils = t("tipDeck.tips", { returnObjects: true });
  const [courant, setCourant] = useState(0);
  const total = conseils.length;
  const aller = (delta) => setCourant((prev) => (prev + delta + total) % total);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="size-4 text-primary" strokeWidth={1.75} />
        <h2 className="font-heading text-sm font-semibold tracking-wide text-on-surface uppercase">
          {t("tipDeck.title")}
        </h2>
      </div>

      <div className="relative h-40 select-none">
        {conseils.map((conseil, index) => {
          const decalage = (index - courant + total) % total;
          return (
            <div
              key={conseil.titre}
              aria-hidden={decalage !== 0}
              className={cn(
                "absolute inset-x-0 top-0 flex h-40 flex-col gap-1.5 rounded-xl p-4 shadow-md transition-all duration-300 ease-out",
                PALETTES[index % PALETTES.length],
              )}
              style={{
                transform: `translate(${decalage * 10}px, ${decalage * 8}px) rotate(${decalage === 0 ? 0 : ROTATIONS[index % ROTATIONS.length]}deg) scale(${1 - decalage * 0.06})`,
                zIndex: total - decalage,
                opacity: decalage > 2 ? 0 : 1,
              }}
            >
              <p className="font-heading text-sm leading-snug font-semibold">
                {conseil.titre}
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                {conseil.texte}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1.5">
          {conseils.map((conseil, index) => (
            <span
              key={conseil.titre}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                index === courant ? "bg-primary" : "bg-outline-variant",
              )}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("tipDeck.previous")}
            onClick={() => aller(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("tipDeck.next")}
            onClick={() => aller(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
