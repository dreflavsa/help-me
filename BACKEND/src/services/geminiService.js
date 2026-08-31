const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`;

class GeminiService {
  async generateContent(parts) {
    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          generationConfig: {
            // On force une température basse : pour une correction
            // académique, on veut de la rigueur et de la cohérence,
            // pas de la créativité (qui serait plutôt utile pour
            // générer une histoire, par exemple).
            temperature: 0.3,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Gemini API a répondu avec le statut ${response.status} : ${errorBody.slice(0, 300)}`,
      );
    }

    const data = await response.json();

    // Structure de réponse Gemini : data.candidates[0].content.parts[0].text
    // Si Gemini bloque la réponse (filtre de sécurité, contenu jugé
    // problématique), `candidates` peut être vide ou absent — d'où
    // cette vérification défensive avant d'accéder aux données.
    const texte = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texte) {
      throw new Error(
        "Gemini n'a renvoyé aucun contenu exploitable (réponse potentiellement bloquée).",
      );
    }

    // usageMetadata est renvoyé par l'API Gemini à côté de `candidates` —
    // absent uniquement dans des cas très marginaux, d'où les valeurs
    // par défaut à 0 plutôt que de laisser `undefined` remonter jusqu'en base.
    const usage = {
      tokensPrompt: data?.usageMetadata?.promptTokenCount || 0,
      tokensReponse: data?.usageMetadata?.candidatesTokenCount || 0,
      tokensTotal: data?.usageMetadata?.totalTokenCount || 0,
    };

    return { texte, usage };
  }
}

module.exports = new GeminiService();
