export async function onRequest(context) {
  const WORKER_URL = context.env.WORKER_URL; // secret env var set in Pages dashboard

  const { request } = context;
  const incoming = new URL(request.url);

  // Forward the query string (?name=..., ?list=1) to the real Worker
  const target = new URL(WORKER_URL);
  target.search = incoming.search;

  const proxied = new Request(target.toString(), {
    method: request.method,
    headers: request.headers,
    body: ["POST", "PUT", "PATCH"].includes(request.method) ? request.body : undefined,
  });

  const response = await fetch(proxied);

  // Pass the response back, adding CORS headers just in case
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}

// Handle preflight OPTIONS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
