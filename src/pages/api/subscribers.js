import { readSubscribers, writeSubscribers } from "../../lib/articles.js";

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  const body = await request.json();
  const email = (body.email || "").trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return json({ error: "Correo electrónico inválido" }, 400);
  }

  const subscribers = readSubscribers();
  if (subscribers.some((s) => s.email === email)) {
    return json({ message: "Ya estabas suscrito" }, 200);
  }

  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  writeSubscribers(subscribers);

  return json({ message: "Suscripción exitosa" }, 201);
}
