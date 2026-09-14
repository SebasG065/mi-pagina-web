import { readConfig } from "../../lib/articles.js";

export const prerender = false;

export async function GET() {
  const config = readConfig();
  return new Response(
    JSON.stringify({ clientId: config.adsenseClientId || "", slots: config.adSlots || {} }),
    { headers: { "Content-Type": "application/json" } }
  );
}
