import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    allowedHosts: [".ts.net"],
  },
  plugins: [
    fresh(),
    tailwindcss(),
  ],
});
