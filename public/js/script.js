document.getElementById("year").textContent = new Date().getFullYear();

const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const formStatus = document.getElementById("formStatus");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.hidden = false;
    formStatus.textContent = "¡Gracias por tu mensaje!";
    contactForm.reset();
  });
}
