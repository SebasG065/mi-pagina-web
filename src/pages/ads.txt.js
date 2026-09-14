import { readConfig } from "../lib/articles.js";

export const prerender = false;

export async function GET() {
  const config = readConfig();
  if (!config.adsenseClientId) {
    return new Response("", { headers: { "Content-Type": "text/plain" } });
  }
  const publisherId = config.adsenseClientId.replace(/^ca-/, "");
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`, {
    headers: { "Content-Type": "text/plain" },
  });
}
