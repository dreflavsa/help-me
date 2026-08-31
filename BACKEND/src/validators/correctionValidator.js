const { z } = require("zod");

const geminiCorrectionSchema = z.object({
    type: z.enum(["EXERCICE", "EXPOSE"]),
    correction: z.string().min(1),
    note: z.number().min(0).max(20).nullable(),
    commentaire: z.string().min(1),
});

module.exports = {
    geminiCorrectionSchema,
};
