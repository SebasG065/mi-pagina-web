import { readArticles, writeArticles } from "../../../lib/articles.js";
import { isAuthorized, unauthorizedResponse } from "../../../lib/admin.js";

export const prerender = false;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET({ params }) {
  const articles = readArticles();
  const article = articles.find((a) => a.id === params.id);
  if (!article) return json({ error: "Artículo no encontrado" }, 404);
  return json(article);
}

export async function PUT({ params, request }) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const articles = readArticles();
  const index = articles.findIndex((a) => a.id === params.id);
  if (index === -1) return json({ error: "Artículo no encontrado" }, 404);

  const body = await request.json();
  const { title, summary, content, author, category, imageUrl } = body;
  const existing = articles[index];
  articles[index] = {
    ...existing,
    title: title ?? existing.title,
    summary: summary ?? existing.summary,
    content: content ?? existing.content,
    author: author ?? existing.author,
    category: category ?? existing.category,
    imageUrl: imageUrl ?? existing.imageUrl,
    updatedAt: new Date().toISOString(),
  };

  writeArticles(articles);
  return json(articles[index]);
}

export async function DELETE({ params, request }) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  const articles = readArticles();
  const index = articles.findIndex((a) => a.id === params.id);
  if (index === -1) return json({ error: "Artículo no encontrado" }, 404);

  const [removed] = articles.splice(index, 1);
  writeArticles(articles);
  return json(removed);
}
