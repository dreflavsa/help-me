import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdateBanner() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000,
      );
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-xs font-medium text-on-primary">
      <span>{t("common.updateAvailable")}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="inline-flex items-center gap-1 rounded-full bg-on-primary/15 px-3 py-1 font-semibold hover:bg-on-primary/25"
      >
        <RefreshCw className="size-3" />
        {t("common.reload")}
      </button>
    </div>
  );
}
