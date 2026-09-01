import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "logo.svg", "apple-touch-icon.png"],
      manifest: {
        name: "HELP ME",
        short_name: "HELP ME",
        description: "Correction de devoirs par IA pour étudiants.",
        theme_color: "#6B4A87",
        background_color: "#F2EEF7",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Navigation (changement de page côté React Router) : si hors
        // ligne, on sert le shell de l'app déjà en cache plutôt qu'une
        // erreur navigateur.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Uniquement les lectures (GET) : on affiche la dernière
            // donnée connue si hors ligne, jamais une donnée
            // "réussie" pour une action qui n'a pas pu partir.
            urlPattern: ({ url, request }) =>
              url.pathname.startsWith("/api") && request.method === "GET",
            method: "GET",
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 60,
                // Au-delà de 24h, la donnée est trop périmée pour
                // valoir la peine d'être montrée comme "actuelle".
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
