import { readArticles } from "../lib/articles.js";

export const prerender = false;

export async function GET({ site }) {
  const base = (site?.origin || "https://mi-pagina-web-lv38.onrender.com").replace(/\/$/, "");
  const articles = readArticles();

  const staticEntries = ["/", "/articulos", "/newsletter"].map(
    (route) => `  <url><loc>${base}${route}</loc></url>`
  );

  const articleEntries = articles.map((article) => {
    const lastmod = (article.updatedAt || article.createdAt).slice(0, 10);
    return `  <url><loc>${base}/articulo/${encodeURIComponent(article.slug)}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...articleEntries].join("\n")}\n</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
