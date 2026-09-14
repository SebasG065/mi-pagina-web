export const prerender = false;

export async function GET({ site }) {
  const base = (site?.origin || "https://mi-pagina-web-lv38.onrender.com").replace(/\/$/, "");
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
