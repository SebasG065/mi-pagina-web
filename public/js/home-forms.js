async function submitEmailCapture(form, emailInput, statusEl, successMessage) {
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

const subscribeForm = document.getElementById("subscribeForm");
if (subscribeForm) {
  subscribeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitEmailCapture(
      subscribeForm,
      document.getElementById("subEmail"),
      document.getElementById("subscribeStatus"),
      "¡Listo! Te avisaremos de los nuevos artículos."
    );
  });
}

const leadMagnetForm = document.getElementById("leadMagnetForm");
if (leadMagnetForm) {
  leadMagnetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitEmailCapture(
      leadMagnetForm,
      document.getElementById("leadEmail"),
      document.getElementById("leadMagnetStatus"),
      "¡Perfecto! La guía te llegará al correo."
    );
  });
}
