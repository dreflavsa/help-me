import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Sunset, Moon } from "lucide-react";
import { getProfilRequest } from "../api/profilApi";

export default function Salutation() {
  const { t } = useTranslation();
  const [prenom, setPrenom] = useState(null);

  useEffect(() => {
    getProfilRequest()
      .then(({ data }) => setPrenom(data.data?.prenom || null))
      .catch(() => {});
  }, []);

  const heure = new Date().getHours();
  let message = t("salutation.goodEvening");
  let Icone = Moon;

  if (heure >= 5 && heure < 12) {
    message = t("salutation.goodMorning");
    Icone = Sun;
  } else if (heure >= 12 && heure < 18) {
    message = t("salutation.goodAfternoon");
    Icone = Sunset;
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icone className="size-5" />
      </div>
      <p className="text-lg sm:text-xl font-semibold text-on-surface truncate">
        {message}
        {prenom && <span className="text-primary">, {prenom}</span>}
      </p>
    </div>
  );
}
