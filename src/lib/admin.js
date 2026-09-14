export function isAuthorized(request) {
  const adminKey = process.env.ADMIN_KEY || "";
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "No autorizado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
