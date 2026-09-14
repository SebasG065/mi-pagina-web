document.addEventListener("DOMContentLoaded", () => {
  const deleteBtn = document.getElementById("deleteBtn");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("¿Seguro que quieres eliminar este artículo?")) return;

    const id = deleteBtn.dataset.articleId;
    const response = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": getAdminKey(),
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      clearAdminKey();
      alert("Clave de administrador incorrecta.");
      return;
    }

    window.location.href = "/articulos";
  });
});
