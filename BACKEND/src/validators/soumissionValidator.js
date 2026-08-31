const { z } = require("zod");

const createSoumissionSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(200),

  consigne: z.string().trim().max(5000).optional(),

  matiere: z.string().trim().min(2, "La matière est obligatoire.").max(150),
});

module.exports = {
  createSoumissionSchema,
};
