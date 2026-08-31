import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggleButton from "./ThemeToggleButton";
import LanguageToggleButton from "./LanguageToggleButton";
import NotificationsButton from "./NotificationsButton";
import ProfileMenu from "./ProfileMenu";
import Salutation from "./Salutation";

const LIENS_ETUDIANT = [
  { to: "/", labelKey: "navigation.dashboard", icone: "dashboard" },
  {
    to: "/soumissions",
    labelKey: "navigation.submissions",
    icone: "description",
  },
  {
    to: "/soumissions/nouvelle",
    labelKey: "navigation.newSubmission",
    icone: "cloud_upload",
  },
  { to: "/profil", labelKey: "navigation.profile", icone: "person" },
  { to: "/packs", labelKey: "navigation.packs", icone: "workspace_premium" },
];

const LIENS_ADMIN = [
  { to: "/admin", labelKey: "navigation.adminDashboard", icone: "dashboard" },
  {
    to: "/admin/paiements",
    labelKey: "navigation.payments",
    icone: "payments",
  },
];

function LienMobileNav({ to, actif, icone, label }) {
  return (
    <Link
      to={to}
      className="flex min-w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium"
    >
      <span
        className={`flex items-center justify-center rounded-full px-4 py-1 transition-all duration-300 ${
          actif
            ? "scale-100 bg-primary/15 text-primary"
            : "scale-95 bg-transparent text-on-surface-variant"
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">{icone}</span>
      </span>
      <span className={actif ? "text-primary" : "text-on-surface-variant"}>
        {label}
      </span>
    </Link>
  );
}

function BandeauHorsLigne() {
  const { t } = useTranslation();
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);

  useEffect(() => {
    const surConnexion = () => setHorsLigne(false);
    const surDeconnexion = () => setHorsLigne(true);

    window.addEventListener("online", surConnexion);
    window.addEventListener("offline", surDeconnexion);

    return () => {
      window.removeEventListener("online", surConnexion);
      window.removeEventListener("offline", surDeconnexion);
    };
  }, []);

  if (!horsLigne) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-xs font-medium text-on-accent">
      <WifiOff className="size-3.5 shrink-0" />
      {t("common.offline")}
    </div>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const estAdmin = user?.role === "ADMIN";
  const liensNav = estAdmin ? LIENS_ADMIN : LIENS_ETUDIANT;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const estActif = (to) => {
    const pathname = location.pathname;

    if (to === "/") return pathname === "/";
    if (to === "/admin") return pathname === "/admin";

    if (to === "/soumissions") {
      return pathname === "/soumissions";
    }

    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* =========================================================
          SIDEBAR DESKTOP
      ========================================================= */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-72 bg-sidebar text-sidebar-foreground shadow-[2px_0_12px_rgba(0,0,0,0.1)]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="HELP ME"
              className="w-16 h-16 rounded-xl shrink-0"
            />

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-sidebar-foreground leading-tight">
                HELP ME
              </h1>

              <p className="text-xs text-sidebar-foreground/70 mt-1">
                {estAdmin
                  ? t("navigation.administration")
                  : t("navigation.studentPortal")}
              </p>
            </div>
          </div>
        </div>

        <ul className="flex-1 py-4 px-3 flex flex-col gap-1">
          {liensNav.map((lien) => {
            const actif = estActif(lien.to);

            return (
              <li key={lien.to}>
                <Link
                  to={lien.to}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    actif
                      ? "bg-sidebar-foreground/15 text-sidebar-foreground font-semibold shadow-sm pl-5"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground hover:shadow-md hover:pl-5"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-sidebar-foreground transition-all duration-300 ${
                      actif
                        ? "h-6 opacity-100"
                        : "h-0 opacity-0 group-hover:h-6 group-hover:opacity-100"
                    }`}
                  />

                  <span className="material-symbols-outlined transition-transform duration-300 group-hover:scale-110">
                    {lien.icone}
                  </span>

                  {t(lien.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/75 hover:bg-error-container hover:text-on-error-container transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            {t("navigation.logout")}
          </button>
        </div>
      </nav>

      {/* =========================================================
          NAVIGATION MOBILE
      ========================================================= */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-20 items-end justify-around border-t border-outline-variant bg-surface/95 px-3 pb-2 pt-3 backdrop-blur lg:hidden"
        aria-label={t("navigation.mobileNavLabel")}
      >
        {estAdmin ? (
          <>
            {liensNav.map((lien) => (
              <LienMobileNav
                key={lien.to}
                to={lien.to}
                actif={estActif(lien.to)}
                icone={lien.icone}
                label={t(lien.labelKey)}
              />
            ))}
          </>
        ) : (
          <>
            <LienMobileNav
              to="/"
              actif={estActif("/")}
              icone="dashboard"
              label={t("navigation.home")}
            />

            <LienMobileNav
              to="/soumissions"
              actif={estActif("/soumissions")}
              icone="description"
              label={t("navigation.submissionsShort")}
            />

            <Link
              to="/soumissions/nouvelle"
              aria-label={t("navigation.newSubmission")}
              className="-mt-8 flex size-16 items-center justify-center rounded-full border-4 border-background bg-primary text-on-primary shadow-lg transition-transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-[26px]">
                cloud_upload
              </span>
            </Link>

            <LienMobileNav
              to="/profil"
              actif={estActif("/profil")}
              icone="person"
              label={t("navigation.profileShort")}
            />

            <LienMobileNav
              to="/packs"
              actif={estActif("/packs")}
              icone="workspace_premium"
              label={t("navigation.packsShort")}
            />
          </>
        )}
      </nav>

      <main className="min-w-0 flex-1 pt-16 lg:ml-72 lg:pt-16 min-h-screen pb-24 lg:pb-0">
        <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-outline-variant bg-surface/90 px-4 backdrop-blur sm:px-6 lg:left-72">
          <Link
            to={estAdmin ? "/admin" : "/"}
            className="flex items-center gap-2 min-w-0 shrink-0 lg:hidden"
          >
            <img
              src="/logo.svg"
              alt="HELP ME"
              className="size-11 shrink-0 sm:size-12"
            />
            <span className="hidden sm:inline font-heading font-bold text-primary text-lg truncate">
              HELP ME
            </span>
          </Link>

          <div className="hidden lg:block min-w-0">
            <Salutation />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <NotificationsButton />
            <LanguageToggleButton />
            <ThemeToggleButton />
            <ProfileMenu />
          </div>
        </header>

        <BandeauHorsLigne />
        <Outlet />
      </main>
    </div>
  );
}
