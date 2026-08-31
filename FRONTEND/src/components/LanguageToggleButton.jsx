import { useTranslation } from "react-i18next";

export default function LanguageToggleButton() {
  const { i18n } = useTranslation();

  const changerLangue = () => {
    const nouvelleLangue = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(nouvelleLangue);
    localStorage.setItem("help-me-language", nouvelleLangue);
  };

  return (
    <button
      onClick={changerLangue}
      aria-label="Changer de langue"
      className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-bold"
    >
      {i18n.language === "fr" ? "EN" : "FR"}
    </button>
  );
}