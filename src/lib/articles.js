import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "articles.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

export function slugify(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(title, articles, excludeId = null) {
  const base = slugify(title) || "articulo";
  const taken = new Set(
    articles.filter((a) => a.id !== excludeId).map((a) => a.slug)
  );
  let slug = base;
  let counter = 2;
  while (taken.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export function readArticles() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

export function writeArticles(articles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

export function readConfig() {
  const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw);
}

export function readSubscribers() {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
  const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
  return JSON.parse(raw);
}

export function writeSubscribers(subscribers) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");
}

export function newArticleId() {
  return crypto.randomUUID();
}

export const CATEGORY_THEMES = {
  "Inteligencia Artificial": { accent: "#4f46e5", soft: "rgba(79, 70, 229, 0.12)", icon: "🤖" },
  "Ciberseguridad": { accent: "#16a34a", soft: "rgba(22, 163, 74, 0.12)", icon: "🔒" },
  "Computación Cuántica": { accent: "#7c3aed", soft: "rgba(124, 58, 237, 0.12)", icon: "⚛️" },
  "Hardware": { accent: "#f59e0b", soft: "rgba(245, 158, 11, 0.12)", icon: "💻" },
  "Movilidad": { accent: "#0ea5e9", soft: "rgba(14, 165, 233, 0.12)", icon: "🚗" },
  "Realidad Aumentada": { accent: "#ec4899", soft: "rgba(236, 72, 153, 0.12)", icon: "🕶️" },
  "Robótica": { accent: "#f97316", soft: "rgba(249, 115, 22, 0.12)", icon: "🤖" },
  default: { accent: "#4f46e5", soft: "rgba(79, 70, 229, 0.12)", icon: "📡" },
};

export function getCategoryTheme(category) {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.default;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export function formatDateEs(isoString) {
  return new Date(isoString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
