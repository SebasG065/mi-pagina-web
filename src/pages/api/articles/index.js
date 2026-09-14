import { readArticles, writeArticles, newArticleId, generateUniqueSlug } from "../../../lib/articles.js";
import { isAuthorized, unauthorizedResponse } from "../../../lib/admin.js";

export const prerender = false;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET({ url }) {
  const articles = readArticles();
  const category = url.searchParams.get("category");
  const filtered = category
    ? articles.filter((a) => a.category.toLowerCase() === category.toLowerCase())
    : articles;
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return json(sorted);
}

export async function POST({ request }) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const body = await request.json();
  const { title, summary, content, author, category, imageUrl } = body;

  if (!title || !summary || !content) {
    return json({ error: "Título, resumen y contenido son obligatorios" }, 400);
  }

  const articles = readArticles();
  const newArticle = {
    id: newArticleId(),
    title,
    summary,
    content,
    author: author || "Anónimo",
    category: category || "General",
    imageUrl: imageUrl || "",
    slug: generateUniqueSlug(title, articles),
    createdAt: new Date().toISOString(),
  };

  articles.push(newArticle);
  writeArticles(articles);

  return json(newArticle, 201);
}
