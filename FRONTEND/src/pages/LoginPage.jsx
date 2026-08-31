/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import OnboardingCarousel from "../components/OnboardingCarousel";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErreur(null);
    setEnvoiEnCours(true);

    try {
      const utilisateur = await login(email, motDePasse);

      if (utilisateur?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setErreur(error.response?.data?.message || t("errors.generic"));
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const champStyle =
    "h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panneau gauche, décoratif — visible à partir de lg */}
      <div className="hidden lg:flex lg:w-[42%] bg-primary text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        <span className="absolute -top-14 -left-10 size-52 rounded-full bg-on-primary/10" />
        <span className="absolute bottom-16 -right-16 size-64 rounded-full bg-on-primary/10" />

        <Link to="/register" className="flex items-center gap-3 relative z-10">
          <img src="/logo.svg" alt="HELP ME" className="size-46 rounded-xl" />
          <span className="font-heading text-xl font-bold">HELP ME</span>
        </Link>

        <OnboardingCarousel />

        <p className="relative z-10 text-xs opacity-60">{t("auth.footer")}</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <img
              src="/logo.svg"
              alt="HELP ME"
              className="size-16 mx-auto lg:hidden rounded-xl mb-4"
            />

            <div className="mb-6 rounded-2xl border border-outline-variant/50 bg-primary/5 p-4 text-left lg:hidden">
              <OnboardingCarousel compact />
            </div>

            <h1 className="font-heading text-2xl font-bold text-primary">
              {t("auth.login")}
            </h1>

            <p className="text-sm text-on-surface-variant mt-1">
              {t("auth.loginDescription")}
            </p>
          </div>

          {erreur && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container"
            >
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-on-surface"
              >
                {t("auth.email")}
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="etudiant@universite.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={champStyle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-on-surface"
              >
                {t("auth.password")}
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />

                <input
                  id="password"
                  name="password"
                  type={afficherMotDePasse ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className={`${champStyle} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                  aria-label={
                    afficherMotDePasse
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {afficherMotDePasse ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={envoiEnCours}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {envoiEnCours ? t("auth.loggingIn") : t("auth.loginButton")}
              </span>

              {!envoiEnCours && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-outline-variant pt-6">
            <p className="text-center text-sm text-on-surface-variant">
              {t("auth.noAccount")}{" "}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                {t("auth.createAccount")}
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-on-surface-variant">
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </div>
  );
}
