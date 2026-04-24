import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL ?? "https://pro.mashbean.net";
const rawBase = process.env.BASE_PATH ?? "/";
const base =
  rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}`;

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  output: "static",
  build: { format: "directory" },
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
});
