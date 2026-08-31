const profilRepository = require("../repositories/profilRepository");

class ProfilService {
    async getProfil(userId) {
        const profil = await profilRepository.findProfilById(userId);

        if (!profil) {
            return {
                success: false,
                code: "PROFIL_NOT_FOUND",
                message: "Profil introuvable.",
            };
        }

        return {
            success: true,
            code: "PROFIL_FOUND",
            message: "Profil récupéré.",
            data: profil,
        };
    }

    async updateProfil(userId, champs) {
        if (champs.matricule) {
            const utilisateurExistant =
                await profilRepository.findUserByMatricule(champs.matricule);

            // On vérifie que le matricule n'est pas déjà pris par UN AUTRE
            // utilisateur — un étudiant qui renvoie son propre matricule
            // inchangé ne doit pas être bloqué par sa propre ligne.
            if (
                utilisateurExistant &&
                utilisateurExistant.id !== Number(userId)
            ) {
                return {
                    success: false,
                    code: "MATRICULE_DEJA_UTILISE",
                    message: "Ce matricule est déjà associé à un autre compte.",
                };
            }
        }

        await profilRepository.updateProfil(userId, champs);

        const profilMisAJour = await profilRepository.findProfilById(userId);

        return {
            success: true,
            code: "PROFIL_UPDATED",
            message: "Profil mis à jour avec succès.",
            data: profilMisAJour,
        };
    }
}

module.exports = new ProfilService();
