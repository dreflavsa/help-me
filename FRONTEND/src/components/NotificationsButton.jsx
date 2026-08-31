/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  listerNotificationsRequest,
  marquerNotificationLueRequest,
} from "../api/notificationApi";

export default function NotificationsButton() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  const tempsEcoule = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return t("notifications.justNow");
    if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });

    const heures = Math.floor(minutes / 60);
    if (heures < 24) return t("notifications.hoursAgo", { count: heures });

    const localeDate = i18n.language === "fr" ? "fr-FR" : "en-US";
    return new Date(dateStr).toLocaleDateString(localeDate);
  };

  const charger = () => {
    listerNotificationsRequest()
      .then(({ data }) => {
        setNotifications(data.data.notifications);
        setNonLues(data.data.nonLues);
      })
      .catch(() => {});
  };

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 30000);
    return () => clearInterval(intervalle);
  }, []);

  useEffect(() => {
    const fermerSiExterieur = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };

    document.addEventListener("mousedown", fermerSiExterieur);
    return () => {
      document.removeEventListener("mousedown", fermerSiExterieur);
    };
  }, []);

  const handleClicNotification = async (notification) => {
    if (!notification.est_lue) {
      await marquerNotificationLueRequest(notification.id).catch(() => {});
      charger();
    }
    setOuvert(false);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOuvert((o) => !o)}
        aria-label={t("notifications.title")}
        aria-expanded={ouvert}
        className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>

        {nonLues > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div
          className="
      fixed
      left-2
      right-2
      top-[4.5rem]
      z-[60]
      max-h-[calc(100vh-6rem)]
      overflow-hidden
      rounded-xl
      border
      border-outline-variant
      bg-surface-container-lowest
      shadow-[0_12px_24px_-8px_rgba(30,39,97,0.18)]

      sm:absolute
      sm:left-auto
      sm:right-0
      sm:top-full
      sm:mt-2
      sm:w-80
      sm:max-h-96
    "
        >
          <div className="border-b border-outline-variant px-4 py-3">
            <h3 className="font-semibold text-on-surface">{t("notifications.title")}</h3>
          </div>

          <div className="max-h-[calc(100vh-9rem)] overflow-x-hidden overflow-y-auto sm:max-h-80">
            {notifications.length === 0 && (
              <p className="p-4 text-center text-sm text-on-surface-variant">{t("notifications.empty")}</p>
            )}

            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClicNotification(n)}
                className={`w-full border-b border-outline-variant p-4 text-left transition-colors last:border-0 hover:bg-surface-container-high ${
                  !n.est_lue ? "bg-secondary-container/30" : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-2">
                  {!n.est_lue && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-on-surface">{n.titre}</p>
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-on-surface-variant">{n.message}</p>
                    <p className="mt-1 text-xs text-outline">{tempsEcoule(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}