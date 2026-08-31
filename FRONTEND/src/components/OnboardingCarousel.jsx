import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud, Sparkles, FileText, Gift } from "lucide-react";

const DIAPOS = [
  {
    Icone: UploadCloud,
    titreKey: "onboarding.slide1Title",
    descKey: "onboarding.slide1Description",
  },
  {
    Icone: Sparkles,
    titreKey: "onboarding.slide2Title",
    descKey: "onboarding.slide2Description",
  },
  {
    Icone: FileText,
    titreKey: "onboarding.slide3Title",
    descKey: "onboarding.slide3Description",
  },
  {
    Icone: Gift,
    titreKey: "onboarding.slide4Title",
    descKey: "onboarding.slide4Description",
  },
];

export default function OnboardingCarousel({ compact = false }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalle = setInterval(() => {
      setIndex((i) => (i + 1) % DIAPOS.length);
    }, 4000);

    return () => clearInterval(intervalle);
  }, []);

  const texteCouleur = compact ? "text-on-surface" : "text-on-primary";
  const texteAttenue = compact
    ? "text-on-surface-variant"
    : "text-on-primary/80";
  const dotActif = compact ? "bg-primary" : "bg-on-primary";
  const dotInactif = compact ? "bg-outline-variant" : "bg-on-primary/40";

  return (
    <div className={compact ? "" : "relative z-10"}>
      <div
        className={`relative overflow-hidden ${compact ? "min-h-[100px]" : "min-h-[168px]"}`}
      >
        {DIAPOS.map((diapo, i) => (
          <div
            key={i}
            className={`transition-opacity duration-500 ${
              i === index
                ? "opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <diapo.Icone
              className={`opacity-90 ${texteCouleur} ${compact ? "size-6 mb-2" : "size-8 mb-4"}`}
            />
            <p
              className={`font-heading font-bold leading-snug ${texteCouleur} ${
                compact ? "text-lg mb-1" : "text-3xl mb-3"
              }`}
            >
              {t(diapo.titreKey)}
            </p>
            <p
              className={`max-w-xs ${texteAttenue} ${compact ? "text-xs" : "text-sm"}`}
            >
              {t(diapo.descKey)}
            </p>
          </div>
        ))}
      </div>

      <div className={`flex gap-2 ${compact ? "mt-3" : "mt-4"}`}>
        {DIAPOS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Diapositive ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? `w-6 ${dotActif}` : `w-1.5 ${dotInactif}`
            }`}
          />
        ))}
      </div>
    </div>
  );
}
