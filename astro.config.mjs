import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  site: "https://mi-pagina-web-lv38.onrender.com",
  adapter: node({
    mode: "standalone",
  }),
});
