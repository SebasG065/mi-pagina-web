const articleGrid = document.getElementById("articleGrid");
const emptyState = document.getElementById("emptyState");
const categoryFilter = document.getElementById("categoryFilter");

let allArticles = [];

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

const ARTICLES_PER_AD = 6;

function renderArticles(articles) {
  articleGrid.innerHTML = "";
  emptyState.hidden = articles.length > 0;

  articles.forEach((article, index) => {
    const card = document.createElement("article");
    card.className = "article-card";

    const safeImageUrl = escapeHtml(article.imageUrl);
    const safeTitle = escapeHtml(article.title);

    card.innerHTML = `
      ${article.imageUrl ? `<div class="article-card-img-wrap"><img src="${safeImageUrl}" alt="${safeTitle}" class="article-card-img"></div>` : ""}
      <div class="article-card-body">
        <span class="tag">${escapeHtml(article.category)}</span>
        <h3><a href="articulo.html?id=${encodeURIComponent(article.id)}">${safeTitle}</a></h3>
        <p>${escapeHtml(article.summary)}</p>
        <div class="article-meta">
          <span>${escapeHtml(article.author)}</span>
          <span>${formatDate(article.createdAt)}</span>
        </div>
      </div>
    `;
    articleGrid.appendChild(card);

    if ((index + 1) % ARTICLES_PER_AD === 0 && index !== articles.length - 1) {
      const adContainer = document.createElement("div");
      adContainer.className = "ad-slot ad-slot-infeed";
      articleGrid.appendChild(adContainer);
      renderAdSlot(adContainer, "inFeed");
    }
  });
}

function populateCategories(articles) {
  const categories = [...new Set(articles.map((a) => a.category))].sort();
  categoryFilter.innerHTML = '<option value="">Todas</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

categoryFilter.addEventListener("change", () => {
  const selected = categoryFilter.value;
  const filtered = selected
    ? allArticles.filter((a) => a.category === selected)
    : allArticles;
  renderArticles(filtered);
});

async function loadArticles() {
  try {
    const response = await fetch("/api/articles");
    allArticles = await response.json();
    populateCategories(allArticles);

    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get("category");

    if (categoryFromUrl && allArticles.some((a) => a.category === categoryFromUrl)) {
      categoryFilter.value = categoryFromUrl;
      renderArticles(allArticles.filter((a) => a.category === categoryFromUrl));
    } else {
      renderArticles(allArticles);
    }
  } catch (error) {
    articleGrid.innerHTML = "<p>No se pudieron cargar los artículos.</p>";
  }
}

loadArticles();
