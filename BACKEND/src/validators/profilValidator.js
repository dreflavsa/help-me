const { z } = require("zod");

const updateProfilSchema = z.object({
    nom: z.string().trim().min(2).max(100).optional(),
    prenom: z.string().trim().min(2).max(100).optional(),
    telephone: z.string().trim().max(20).optional(),
    matricule: z.string().trim().min(3).max(50).optional(),
    filiere_id: z.coerce.number().int().positive().optional(),
    niveau_id: z.coerce.number().int().positive().optional(),
});

module.exports = {
    updateProfilSchema,
};
