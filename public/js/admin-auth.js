function getAdminKey() {
  let key = localStorage.getItem("binarioAdminKey");
  if (!key) {
    key = window.prompt("Clave de administrador (para publicar, editar o borrar):") || "";
    if (key) localStorage.setItem("binarioAdminKey", key);
  }
  return key;
}

function clearAdminKey() {
  localStorage.removeItem("binarioAdminKey");
}
