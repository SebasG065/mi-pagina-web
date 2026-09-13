const detailContainer = document.getElementById("articleDetail");

function initArticlePage() {
  const id = detailContainer.dataset.articleId;
  if (!id) return;

  const adSlot = document.getElementById("articleAdSlot");
  if (adSlot) {
    renderAdSlot(adSlot, "article");
  }

  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("¿Seguro que quieres eliminar este artículo?")) return;
      await fetch(`/api/articles/${encodeURIComponent(id)}`, { method: "DELETE" });
      window.location.href = "articulos.html";
    });
  }
}

initArticlePage();
