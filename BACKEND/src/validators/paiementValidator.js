const { z } = require("zod");

const declarerPaiementSchema = z.object({
  plan: z.enum(["STANDARD", "PREMIUM"], {
    errorMap: () => ({ message: "Le plan choisi n'est pas valide." }),
  }),
  montant: z.coerce.number().int().positive("Le montant est obligatoire."),
  numero_payeur: z
    .string()
    .trim()
    .min(8, "Le numéro utilisé pour le paiement est obligatoire.")
    .max(20),
  reference_transaction: z
    .string()
    .trim()
    .min(4, "La référence de transaction est obligatoire.")
    .max(50),
});

const refuserPaiementSchema = z.object({
  motif: z.string().trim().max(255).optional(),
});

module.exports = { declarerPaiementSchema, refuserPaiementSchema };
