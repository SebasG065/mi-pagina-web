const articleForm = document.getElementById("articleForm");
const formStatus = document.getElementById("formStatus");

articleForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value.trim(),
    author: document.getElementById("author").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    summary: document.getElementById("summary").value.trim(),
    content: document.getElementById("content").value.trim(),
  };

  formStatus.hidden = true;

  try {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": getAdminKey() },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      clearAdminKey();
      throw new Error("Clave de administrador incorrecta. Intenta de nuevo.");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al publicar el artículo");
    }

    const article = await response.json();
    window.location.href = `articulo.html?id=${encodeURIComponent(article.id)}`;
  } catch (error) {
    formStatus.hidden = false;
    formStatus.textContent = error.message;
    formStatus.classList.add("form-status-error");
  }
});
