const SPOTLIGHT_CATEGORY = "Apple";
const SPOTLIGHT_TITLE = "Cobertura especial: Apple Event 2026";
const CATEGORY_SECTIONS_LIMIT = 3;
const ARTICLES_PER_CATEGORY_SECTION = 3;
const TRENDING_CATEGORY_LIMIT = 3;

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_THEMES = {
  "Inteligencia Artificial": { accent: "#4f46e5", soft: "rgba(79, 70, 229, 0.12)", icon: "🤖" },
  "Ciberseguridad": { accent: "#16a34a", soft: "rgba(22, 163, 74, 0.12)", icon: "🔒" },
  "Computación Cuántica": { accent: "#7c3aed", soft: "rgba(124, 58, 237, 0.12)", icon: "⚛️" },
  "Hardware": { accent: "#f59e0b", soft: "rgba(245, 158, 11, 0.12)", icon: "💻" },
  "Movilidad": { accent: "#0ea5e9", soft: "rgba(14, 165, 233, 0.12)", icon: "🚗" },
  "Realidad Aumentada": { accent: "#ec4899", soft: "rgba(236, 72, 153, 0.12)", icon: "🕶️" },
  "Robótica": { accent: "#f97316", soft: "rgba(249, 115, 22, 0.12)", icon: "🤖" },
  default: { accent: "#4f46e5", soft: "rgba(79, 70, 229, 0.12)", icon: "📡" },
};

function getCategoryTheme(category) {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.default;
}

function articleCardHtml(article) {
  const safeImageUrl = escapeHtml(article.imageUrl);
  const safeTitle = escapeHtml(article.title);
  const theme = getCategoryTheme(article.category);
  return `
    <article class="article-card" data-category="${escapeHtml(article.category)}" style="--card-accent:${theme.accent}; --card-soft:${theme.soft};">
      ${article.imageUrl ? `<div class="article-card-img-wrap"><img src="${safeImageUrl}" alt="${safeTitle}" class="article-card-img"></div>` : ""}
      <div class="article-card-body">
        <span class="tag"><span class="tag-icon">${theme.icon}</span>${escapeHtml(article.category)}</span>
        <h3><a href="articulo.html?id=${encodeURIComponent(article.id)}">${safeTitle}</a></h3>
        <p>${escapeHtml(article.summary)}</p>
        <div class="article-meta">
          <span>${escapeHtml(article.author)}</span>
          <span>${formatDate(article.createdAt)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderHeroStats(articles, categories) {
  const heroStats = document.getElementById("heroStats");
  heroStats.innerHTML = `
    <span><strong>${articles.length}</strong>artículos publicados</span>
    <span><strong>${categories.length}</strong>categorías</span>
  `;
}

function renderCategoryChips(categories) {
  const container = document.getElementById("categoryChips");
  container.innerHTML = categories
    .map(
      (category) =>
        `<a class="chip" href="articulos.html?category=${encodeURIComponent(category)}">${escapeHtml(category)}</a>`
    )
    .join("");
}

function renderFeaturedArticles(articles) {
  const grid = document.getElementById("featuredGrid");
  grid.innerHTML = articles.slice(0, 6).map(articleCardHtml).join("");
}

function renderSpotlight(articles) {
  const spotlightArticles = articles.filter((a) => a.category === SPOTLIGHT_CATEGORY);
  if (spotlightArticles.length === 0) return;

  document.getElementById("spotlightSection").hidden = false;
  document.getElementById("spotlightTitle").textContent = SPOTLIGHT_TITLE;
  document.getElementById("spotlightLink").href =
    `articulos.html?category=${encodeURIComponent(SPOTLIGHT_CATEGORY)}`;
  document.getElementById("spotlightGrid").innerHTML = spotlightArticles
    .slice(0, 4)
    .map(articleCardHtml)
    .join("");
}

function renderTrendingCategory(articles) {
  const byCategory = new Map();
  articles.forEach((article) => {
    if (!byCategory.has(article.category)) byCategory.set(article.category, []);
    byCategory.get(article.category).push(article);
  });

  const [category, categoryArticles] = [...byCategory.entries()].sort(
    (a, b) => b[1].length - a[1].length
  )[0] || [null, []];

  const section = document.getElementById("trendingCategorySection");
  if (!category || categoryArticles.length === 0) {
    section.hidden = true;
    return;
  }

  const categoryLink = `articulos.html?category=${encodeURIComponent(category)}`;
  document.getElementById("trendingCategoryTitle").textContent = category;
  document.getElementById("trendingCategoryLink").href = categoryLink;
  document.getElementById("trendingCategoryGrid").innerHTML = categoryArticles
    .slice(0, TRENDING_CATEGORY_LIMIT)
    .map(articleCardHtml)
    .join("");
  section.hidden = false;
}

function renderCategorySections(articles) {
  const container = document.getElementById("categorySections");
  const byCategory = new Map();

  articles.forEach((article) => {
    if (article.category === SPOTLIGHT_CATEGORY) return;
    if (!byCategory.has(article.category)) byCategory.set(article.category, []);
    byCategory.get(article.category).push(article);
  });

  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, CATEGORY_SECTIONS_LIMIT);

  container.innerHTML = topCategories
    .map(([category, categoryArticles], index) => {
      const cards = categoryArticles
        .slice(0, ARTICLES_PER_CATEGORY_SECTION)
        .map(articleCardHtml)
        .join("");
      const altClass = index % 2 === 0 ? " section-alt" : "";
      return `
        <section class="section${altClass}" style="padding-top: 2.5rem; padding-bottom: 2.5rem;">
          <div class="articles-header">
            <h2>${escapeHtml(category)}</h2>
            <a href="articulos.html?category=${encodeURIComponent(category)}" class="link-more">Ver más →</a>
          </div>
          <div class="article-grid">${cards}</div>
        </section>
      `;
    })
    .join("");
}

async function loadHomeContent() {
  try {
    const response = await fetch("/api/articles");
    const articles = await response.json();
    const categories = [...new Set(articles.map((a) => a.category))].sort();

    renderHeroStats(articles, categories);
    renderCategoryChips(categories);
    renderFeaturedArticles(articles);
    renderSpotlight(articles);
    renderTrendingCategory(articles);
    renderCategorySections(articles);
  } catch (error) {
    document.getElementById("featuredGrid").innerHTML =
      "<p>No se pudieron cargar los artículos.</p>";
  }
}

const subscribeForm = document.getElementById("subscribeForm");
const subscribeStatus = document.getElementById("subscribeStatus");
const leadMagnetForm = document.getElementById("leadMagnetForm");
const leadMagnetStatus = document.getElementById("leadMagnetStatus");

async function submitEmailCapture(form, emailInput, statusEl, successMessage) {
  event.preventDefault();
  const email = emailInput.value.trim();

  statusEl.hidden = true;
  statusEl.classList.remove("form-status-error");

  try {
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo completar la suscripción");
    }

    statusEl.hidden = false;
    statusEl.textContent = successMessage;
    form.reset();
  } catch (error) {
    statusEl.hidden = false;
    statusEl.classList.add("form-status-error");
    statusEl.textContent = error.message;
  }
}

subscribeForm.addEventListener("submit", async (event) => {
  await submitEmailCapture(
    subscribeForm,
    document.getElementById("subEmail"),
    subscribeStatus,
    "¡Listo! Te avisaremos de los nuevos artículos."
  );
});

if (leadMagnetForm) {
  leadMagnetForm.addEventListener("submit", async (event) => {
    await submitEmailCapture(
      leadMagnetForm,
      document.getElementById("leadEmail"),
      leadMagnetStatus,
      "¡Perfecto! La guía te llegará al correo."
    );
  });
}

loadHomeContent();
