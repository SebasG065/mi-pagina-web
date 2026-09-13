const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "articles.json");
const CONFIG_FILE = path.join(__dirname, "data", "config.json");
const SUBSCRIBERS_FILE = path.join(__dirname, "data", "subscribers.json");

app.use(express.json());

function readArticles() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeArticles(articles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

function readConfig() {
  const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw);
}

function readSubscribers() {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeSubscribers(subscribers) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function renderTemplate(template, replacements) {
  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

function formatDateEs(isoString) {
  return new Date(isoString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

// SEO: robots.txt apunta a un sitemap generado dinámicamente con todos los artículos.
app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

// SEO: sitemap.xml lista páginas estáticas y cada artículo, para que los buscadores los indexen.
app.get("/sitemap.xml", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const articles = readArticles();

  const staticEntries = ["/", "/articulos.html", "/publicar.html"].map(
    (route) => `  <url><loc>${baseUrl}${route}</loc></url>`
  );

  const articleEntries = articles.map((article) => {
    const lastmod = (article.updatedAt || article.createdAt).slice(0, 10);
    return `  <url><loc>${baseUrl}/articulo.html?id=${encodeURIComponent(article.id)}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...articleEntries].join("\n")}\n</urlset>`;

  res.type("application/xml").send(xml);
});

// SEO: renderiza articulo.html en el servidor con título, meta description, Open Graph
// y datos estructurados reales, para que buscadores y redes sociales vean el contenido
// sin depender de que ejecuten JavaScript.
app.get("/articulo.html", (req, res) => {
  const template = fs.readFileSync(
    path.join(__dirname, "public", "articulo.html"),
    "utf-8"
  );
  const baseUrl = getBaseUrl(req);
  const { id } = req.query;
  const articles = readArticles();
  const article = id ? articles.find((a) => a.id === id) : null;

  if (!article) {
    const html = renderTemplate(template, {
      TITLE: "Artículo no encontrado | Binario",
      DESCRIPTION: "El artículo que buscas no existe o fue eliminado.",
      OG_IMAGE_TAG: "",
      CANONICAL_URL: `${baseUrl}/articulos.html`,
      JSONLD: "",
      ARTICLE_ID: "",
      ARTICLE_CONTENT: id
        ? "<p>Artículo no encontrado.</p>"
        : "<p>Artículo no especificado.</p>",
    });
    res.status(id ? 404 : 400);
    res.set("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  }

  const canonicalUrl = `${baseUrl}/articulo.html?id=${encodeURIComponent(article.id)}`;
  const safeTitle = escapeHtml(article.title);
  const safeDescription = escapeHtml(article.summary);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    author: { "@type": "Person", name: article.author },
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
  };

  const articleContent = `
    <a href="articulos.html" class="back-link">&larr; Volver a artículos</a>
    ${article.imageUrl ? `<img src="${escapeHtml(article.imageUrl)}" alt="${safeTitle}" class="article-detail-img">` : ""}
    <span class="tag">${escapeHtml(article.category)}</span>
    <h1>${safeTitle}</h1>
    <div class="article-meta">
      <span>Por ${escapeHtml(article.author)}</span>
      <span>${formatDateEs(article.createdAt)}</span>
    </div>
    <div class="article-body">${escapeHtml(article.content).replace(/\n/g, "<br>")}</div>
    <div class="ad-slot" id="articleAdSlot"></div>
    <button id="deleteBtn" class="btn btn-danger">Eliminar artículo</button>
  `;

  const html = renderTemplate(template, {
    TITLE: `${safeTitle} | Binario`,
    DESCRIPTION: safeDescription,
    OG_IMAGE_TAG: article.imageUrl
      ? `<meta property="og:image" content="${escapeHtml(article.imageUrl)}">`
      : "",
    CANONICAL_URL: canonicalUrl,
    JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    ARTICLE_ID: escapeHtml(article.id),
    ARTICLE_CONTENT: articleContent,
  });

  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/articles", (req, res) => {
  const articles = readArticles();
  const { category } = req.query;
  const filtered = category
    ? articles.filter((a) => a.category.toLowerCase() === category.toLowerCase())
    : articles;
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sorted);
});

app.get("/api/articles/:id", (req, res) => {
  const articles = readArticles();
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: "Artículo no encontrado" });
  }
  res.json(article);
});

app.post("/api/articles", (req, res) => {
  const { title, summary, content, author, category, imageUrl } = req.body;

  if (!title || !summary || !content) {
    return res
      .status(400)
      .json({ error: "Título, resumen y contenido son obligatorios" });
  }

  const articles = readArticles();
  const newArticle = {
    id: crypto.randomUUID(),
    title,
    summary,
    content,
    author: author || "Anónimo",
    category: category || "General",
    imageUrl: imageUrl || "",
    createdAt: new Date().toISOString(),
  };

  articles.push(newArticle);
  writeArticles(articles);
  res.status(201).json(newArticle);
});

app.put("/api/articles/:id", (req, res) => {
  const articles = readArticles();
  const index = articles.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Artículo no encontrado" });
  }

  const { title, summary, content, author, category, imageUrl } = req.body;
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
  res.json(articles[index]);
});

app.delete("/api/articles/:id", (req, res) => {
  const articles = readArticles();
  const index = articles.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Artículo no encontrado" });
  }

  const [removed] = articles.splice(index, 1);
  writeArticles(articles);
  res.json(removed);
});

app.get("/api/ads-config", (req, res) => {
  const config = readConfig();
  res.json({
    clientId: config.adsenseClientId || "",
    slots: config.adSlots || {},
  });
});

app.get("/ads.txt", (req, res) => {
  const config = readConfig();
  res.type("text/plain");
  if (!config.adsenseClientId) {
    return res.send("");
  }
  const publisherId = config.adsenseClientId.replace(/^ca-/, "");
  res.send(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`);
});

app.post("/api/subscribers", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Correo electrónico inválido" });
  }

  const subscribers = readSubscribers();
  if (subscribers.some((s) => s.email === email)) {
    return res.status(200).json({ message: "Ya estabas suscrito" });
  }

  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  writeSubscribers(subscribers);
  res.status(201).json({ message: "Suscripción exitosa" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
