const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authRepository = require("../repositories/authRepository");
const subscriptionService = require("./subscriptionService");

class AuthService {
  async register(userData) {
    const existingUser = await authRepository.findUserByEmail(userData.email);

    if (existingUser) {
      return {
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message: "Cette adresse e-mail est déjà utilisée.",
      };
    }

    // Dans la méthode register(), remplacer TOUT le bloc qui va de
    // "// Recherche de la filière saisie par l'étudiant" jusqu'à juste avant
    // "// Vérification du niveau" par ceci :

    // Recherche de l'établissement saisi par l'étudiant
    let etablissement = await authRepository.findEtablissementByName(
      userData.etablissement,
    );

    // S'il n'existe pas, on le crée
    if (!etablissement) {
      const etablissementId = await authRepository.createEtablissement(
        userData.etablissement,
      );

      etablissement = {
        id: etablissementId,
        nom: userData.etablissement.trim(),
      };
    }

    // Recherche de la filière saisie par l'étudiant, scopée à son établissement
    let filiere = await authRepository.findFiliereByName(
      userData.filiere,
      etablissement.id,
    );

    // Si la filière n'existe pas encore pour cet établissement, on la crée
    if (!filiere) {
      const filiereId = await authRepository.createFiliere(
        userData.filiere,
        etablissement.id,
      );

      filiere = {
        id: filiereId,
        nom: userData.filiere.trim(),
      };
    }

    // Vérification du niveau
    const niveau = await authRepository.findNiveauById(userData.niveau_id);

    if (!niveau) {
      return {
        success: false,
        code: "NIVEAU_NOT_FOUND",
        message: "Le niveau sélectionné n'existe pas.",
      };
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 12);

    // Création de l'utilisateur
    const userId = await authRepository.createUser({
      ...userData,
      filiere_id: filiere.id,
      mot_de_passe: hashedPassword,
    });
    await subscriptionService.creerAbonnementGratuit(userId);

    return {
      success: true,
      code: "USER_CREATED",
      message: "Utilisateur créé avec succès.",
      data: {
        id: userId,
      },
    };
  }

  async login(email, motDePasse) {
    const user = await authRepository.findUserForLogin(email);

    if (!user) {
      return {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Email ou mot de passe incorrect.",
      };
    }

    if (user.deleted_at !== null) {
      return {
        success: false,
        code: "ACCOUNT_DELETED",
        message: "Ce compte n'est plus disponible.",
      };
    }

    const passwordMatch = await bcrypt.compare(motDePasse, user.mot_de_passe);

    if (!passwordMatch) {
      return {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Email ou mot de passe incorrect.",
      };
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        role_id: user.role_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Création du refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const expireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.saveRefreshToken(user.id, refreshTokenHash, expireLe);

    await authRepository.updateLastLogin(user.id);

    return {
      success: true,
      code: "LOGIN_SUCCESS",
      message: "Connexion réussie.",
      data: {
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role_id: user.role_id,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(refreshToken) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored =
      await authRepository.findRefreshTokenByHash(refreshTokenHash);

    if (!stored) {
      return {
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Refresh token invalide.",
      };
    }

    if (stored.est_revoque) {
      return {
        success: false,
        code: "REFRESH_TOKEN_REVOKED",
        message: "Ce refresh token a été révoqué.",
      };
    }

    if (new Date(stored.expire_le) < new Date()) {
      return {
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Votre session a expiré, veuillez vous reconnecter.",
      };
    }

    const user = await authRepository.findUserById(stored.utilisateur_id);

    if (!user || user.deleted_at !== null) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        message: "Utilisateur introuvable.",
      };
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        role_id: user.role_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return {
      success: true,
      code: "TOKEN_REFRESHED",
      message: "Token renouvelé avec succès.",
      data: {
        accessToken,
      },
    };
  }

  async logout(refreshToken) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored =
      await authRepository.findRefreshTokenByHash(refreshTokenHash);

    if (stored && !stored.est_revoque) {
      await authRepository.revokeRefreshTokenById(stored.id);
    }

    return {
      success: true,
      code: "LOGOUT_SUCCESS",
      message: "Déconnexion réussie.",
    };
  }
}

module.exports = new AuthService();
