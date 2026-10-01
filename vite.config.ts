import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.svg", "sounds/*"],
      manifest: {
        name: "Bluff",
        short_name: "Bluff",
        description: "Barrierefreies Würfel-Bluffspiel",
        start_url: ".",
        display: "standalone",
        background_color: "#0f2b1c",
        theme_color: "#0f2b1c",
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,wav,mp3}"]
      }
    })
  ]
});
