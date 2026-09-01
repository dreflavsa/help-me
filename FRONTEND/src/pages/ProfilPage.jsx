/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { SkeletonPage } from "../components/ui/Skeleton";

import {
  ArrowLeft,
  Save,
  GraduationCap,
  Mail,
  Phone,
  Hash,
  Building2,
  LogOut,
  Settings,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from "lucide-react";
import { getProfilRequest, updateProfilRequest } from "../api/profilApi";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Field, FieldGroup, FieldLabel } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export default function ProfilPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    matricule: "",
  });

  useEffect(() => {
    getProfilRequest()
      .then(({ data }) => {
        const p = data.data;
        setProfil(p);
        setForm({
          nom: p.nom || "",
          prenom: p.prenom || "",
          telephone: p.telephone || "",
          matricule: p.matricule || "",
        });
      })
      .catch(() => setErreur(t("profile.loadError")))
      .finally(() => setChargement(false));
  }, []);

  const handleChange = (e) =>
    setForm((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);
    setSucces(false);
    setEnregistrement(true);
    try {
      const { data } = await updateProfilRequest(form);
      setProfil(data.data);
      setSucces(true);
    } catch (error) {
      setErreur(error.response?.data?.message || t("profile.updateError"));
    } finally {
      setEnregistrement(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const changerLangue = (langue) => {
    i18n.changeLanguage(langue);
    localStorage.setItem("help-me-language", langue);
  };

  const initiales = profil
    ? `${profil.prenom?.[0] || ""}${profil.nom?.[0] || ""}`.toUpperCase()
    : "";
  const champStyle =
    "h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors";

  if (chargement) {
    return <SkeletonPage />;
  }

  return (
    <div className="bg-background">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-10 py-8">
        <Link
          to="/"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("profile.backToDashboard")}
        </Link>

        <h1 className="font-heading text-2xl font-bold text-primary mb-1">
          {t("profile.title")}
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          {t("profile.subtitle")}
        </p>

        {erreur && (
          <Card className="mb-6 py-4 bg-error-container border-none">
            <CardContent className="text-sm text-on-error-container">
              {erreur}
            </CardContent>
          </Card>
        )}
        {succes && (
          <Card className="mb-6 py-4 bg-primary/10 border-none">
            <CardContent className="text-sm text-primary">
              {t("profile.updateSuccess")}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
          {/* Carte d'étudiant */}
          <div className="relative overflow-hidden rounded-3xl bg-primary text-on-primary shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <GraduationCap className="size-7 opacity-80" />
                <span className="font-heading text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
                  {t("profile.studentCard")}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-on-primary/15 font-heading text-2xl font-bold">
                  {initiales}
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-xl font-bold truncate">
                    {profil.prenom} {profil.nom}
                  </p>
                  <p className="text-sm opacity-80 truncate">{profil.email}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-6 border-t-2 border-dashed border-on-primary/25">
              <span className="absolute -left-9 -top-3 size-6 rounded-full bg-background" />
              <span className="absolute -right-9 -top-3 size-6 rounded-full bg-background" />
            </div>

            <div className="p-6 pt-5 space-y-3">
              <div className="flex items-center gap-3">
                <Hash className="size-4 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide opacity-70">
                    {t("profile.matricule")}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {profil.matricule || t("profile.notProvided")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="size-4 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide opacity-70">
                    {t("auth.major")}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {profil.filiere}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="size-4 opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide opacity-70">
                    {t("auth.level")}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {profil.niveau}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="px-6">
            <CardHeader>
              <CardTitle>{t("profile.editInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="nom">
                        {t("auth.lastName")}
                      </FieldLabel>
                      <input
                        id="nom"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        className={champStyle}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="prenom">
                        {t("auth.firstName")}
                      </FieldLabel>
                      <input
                        id="prenom"
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        className={champStyle}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="telephone">
                      {t("profile.phone")}
                    </FieldLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input
                        id="telephone"
                        name="telephone"
                        placeholder={t("profile.phonePlaceholder")}
                        value={form.telephone}
                        onChange={handleChange}
                        className={`${champStyle} pl-10`}
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="matricule">
                      {t("profile.matricule")}
                    </FieldLabel>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input
                        id="matricule"
                        name="matricule"
                        placeholder={t("profile.matriculePlaceholder")}
                        value={form.matricule}
                        onChange={handleChange}
                        className={`${champStyle} pl-10`}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {t("profile.matriculeHelp")}
                    </p>
                  </Field>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">
                    <Mail className="size-3.5 shrink-0" />
                    {t("profile.emailLocked")}
                  </div>

                  <Button
                    type="submit"
                    disabled={enregistrement}
                    className="sm:w-auto"
                  >
                    <Save className="size-4" />
                    {enregistrement ? t("profile.saving") : t("common.save")}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Préférences — mobile uniquement */}
        <section className="mt-6 lg:hidden">
          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
            {/* En-tête */}
            <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings className="size-4.5" />
              </span>

              <div>
                <h2 className="text-sm font-semibold text-on-surface">
                  {t("profile.preferences.title")}
                </h2>

                <p className="text-xs text-on-surface-variant">
                  {t("profile.preferences.subtitle")}
                </p>
              </div>
            </div>

            {/* Thème */}
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                  {theme === "dark" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    {t("profile.preferences.theme")}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    {theme === "dark"
                      ? t("profile.preferences.dark")
                      : t("profile.preferences.light")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                aria-label={t("profile.preferences.changeTheme")}
              >
                {theme === "dark" ? (
                  <Moon className="size-3.5" />
                ) : (
                  <Sun className="size-3.5" />
                )}

                {theme === "dark"
                  ? t("profile.preferences.dark")
                  : t("profile.preferences.light")}

                <ChevronDown className="size-3.5" />
              </button>
            </div>

            {/* Langue */}
            <div className="border-t border-outline-variant">
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                    <Globe className="size-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface">
                      {t("profile.preferences.language")}
                    </p>

                    <p className="text-xs text-on-surface-variant">
                      {i18n.language === "en"
                        ? t("profile.preferences.english")
                        : t("profile.preferences.french")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-outline-variant bg-surface-container p-1">
                  <button
                    type="button"
                    onClick={() => changerLangue("fr")}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      i18n.language === "fr"
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                    aria-label={t("profile.preferences.french")}
                  >
                    🇫🇷 FR
                  </button>

                  <button
                    type="button"
                    onClick={() => changerLangue("en")}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      i18n.language === "en"
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                    aria-label={t("profile.preferences.english")}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Déconnexion — mobile uniquement */}
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-semibold text-error transition-colors hover:bg-error-container lg:hidden"
        >
          <LogOut className="size-4" />
          {t("navigation.logout")}
        </button>
      </div>
    </div>
  );
}
