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
      const response = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() },
      });
      if (response.status === 401) {
        clearAdminKey();
        alert("Clave de administrador incorrecta.");
        return;
      }
      window.location.href = "articulos.html";
    });
  }
}

initArticlePage();
