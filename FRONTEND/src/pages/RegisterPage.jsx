/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  Building2,
  GraduationCap,
  BookOpen,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNiveauxRequest } from "../api/authApi";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [niveaux, setNiveaux] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [afficherMdp, setAfficherMdp] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: "",
    etablissement: "",
    filiere: "",
    niveau_id: "",
  });

  useEffect(() => {
    getNiveauxRequest()
      .then(({ data }) => setNiveaux(data.data))
      .catch(() => setErreur(t("errors.loadLevels")));
  }, []);

  const handleChange = (e) =>
    setForm((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      await register(form);
      navigate("/login");
    } catch (error) {
      setErreur(error.response?.data?.message || t("errors.generic"));
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const champStyle =
    "h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
  const champSimple =
    "h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
  const labelStyle = "block text-sm font-semibold text-on-surface mb-1.5";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panneau gauche, décoratif — visible à partir de lg */}
      <div className="hidden lg:flex lg:w-[42%] bg-primary text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        <span className="absolute -top-10 -right-10 size-56 rounded-full bg-on-primary/10" />
        <span className="absolute bottom-24 -left-14 size-40 rounded-full bg-on-primary/10" />

        <Link to="/login" className="flex items-center gap-3 relative z-10">
          <img src="/logo.svg" alt="HELP ME" className="size-46 rounded-xl" />
          <span className="font-heading text-xl font-bold">HELP ME</span>
        </Link>

        <div className="relative z-10">
          <Sparkles className="size-8 mb-4 opacity-80" />
          <p className="font-heading text-3xl font-bold leading-snug mb-3">
            {t("auth.registerTagline1")}
            <br />
            {t("auth.registerTagline2")}
          </p>
          <p className="text-sm opacity-80 max-w-xs">
            {t("auth.registerSubtext")}
          </p>
        </div>

        <p className="relative z-10 text-xs opacity-60">{t("auth.footer")}</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md py-8">
          <div className="text-center lg:text-left mb-8">
            <img
              src="/logo.svg"
              alt="HELP ME"
              className="size-16 mx-auto lg:hidden rounded-xl mb-4"
            />
            <h1 className="font-heading text-2xl font-bold text-primary">
              {t("auth.createAccountTitle")}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {t("auth.createAccountSubtitle")}
            </p>
          </div>

          {erreur && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm">
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                {t("auth.sectionWhoAreYou")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="nom" className={labelStyle}>
                    {t("auth.lastName")}
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    required
                    value={form.nom}
                    onChange={handleChange}
                    className={champSimple}
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className={labelStyle}>
                    {t("auth.firstName")}
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    required
                    value={form.prenom}
                    onChange={handleChange}
                    className={champSimple}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                {t("auth.sectionAccess")}
              </p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className={labelStyle}>
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="etudiant@universite.cm"
                      value={form.email}
                      onChange={handleChange}
                      className={champStyle}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mot_de_passe" className={labelStyle}>
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                    <input
                      id="mot_de_passe"
                      name="mot_de_passe"
                      type={afficherMdp ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.mot_de_passe}
                      onChange={handleChange}
                      className={`${champStyle} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setAfficherMdp((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      aria-label={
                        afficherMdp
                          ? t("auth.hidePassword")
                          : t("auth.showPassword")
                      }
                    >
                      {afficherMdp ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmation_mot_de_passe"
                    className={labelStyle}
                  >
                    {t("auth.confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                    <input
                      id="confirmation_mot_de_passe"
                      name="confirmation_mot_de_passe"
                      type={afficherMdp ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.confirmation_mot_de_passe}
                      onChange={handleChange}
                      className={champStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                {t("auth.sectionPath")}
              </p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="etablissement" className={labelStyle}>
                    {t("auth.institution")}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                    <input
                      id="etablissement"
                      name="etablissement"
                      type="text"
                      required
                      placeholder={t("auth.institutionPlaceholder")}
                      value={form.etablissement}
                      onChange={handleChange}
                      className={champStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="filiere" className={labelStyle}>
                      {t("auth.major")}
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input
                        id="filiere"
                        name="filiere"
                        type="text"
                        required
                        placeholder={t("auth.majorPlaceholder")}
                        value={form.filiere}
                        onChange={handleChange}
                        className={champStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="niveau_id" className={labelStyle}>
                      {t("auth.level")}
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <select
                        id="niveau_id"
                        name="niveau_id"
                        required
                        value={form.niveau_id}
                        onChange={handleChange}
                        className={`${champStyle} appearance-none`}
                      >
                        <option value="">--</option>
                        {niveaux.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {envoiEnCours ? (
                t("auth.registeringInProgress")
              ) : (
                <>
                  <UserPlus className="size-4" />
                  {t("auth.registerButton")}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              {t("auth.loginButton")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
