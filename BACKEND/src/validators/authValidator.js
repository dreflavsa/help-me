const { z } = require("zod");

const registerSchema = z
  .object({
    nom: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(100),

    prenom: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères.")
      .max(100),

    email: z.string().trim().email("Adresse e-mail invalide.").max(150),

    mot_de_passe: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères."),

    confirmation_mot_de_passe: z
      .string()
      .min(1, "La confirmation du mot de passe est obligatoire."),

    etablissement: z
      .string()
      .trim()
      .min(2, "L'établissement est obligatoire.")
      .max(150),

    filiere: z.string().trim().min(2, "La filière est obligatoire.").max(150),

    // Le select HTML renvoie une chaîne.
    // z.coerce.number() la convertit automatiquement en nombre.
    niveau_id: z.coerce.number().int().positive("Le niveau est obligatoire."),
  })
  .refine((data) => data.mot_de_passe === data.confirmation_mot_de_passe, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmation_mot_de_passe"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),

  mot_de_passe: z.string().min(1, "Le mot de passe est obligatoire."),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est obligatoire."),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
