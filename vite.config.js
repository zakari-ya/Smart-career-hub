import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.convex\.site\/.*/,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "convex-api",
                            expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2)$/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "assets",
                            expiration: { maxEntries: 50 }
                        }
                    }
                ]
            },
            manifest: {
                name: "Smart Career Hub",
                short_name: "CareerHub",
                description: "AI-powered resume and portfolio intelligence",
                theme_color: "#0f172a",
                background_color: "#0f172a",
                display: "standalone",
                start_url: "/",
                icons: [
                    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
                    { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
