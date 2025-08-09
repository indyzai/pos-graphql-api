// Supabase Edge Function: proxy to your GraphQL server (uses graphql/server execution)
// Required env: UPSTREAM_GRAPHQL_URL (e.g., https://your-node-api.example.com/graphql)

function createCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();
  headers.set("access-control-allow-origin", origin ?? "*");
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("access-control-allow-headers", "authorization, content-type");
  headers.set("access-control-max-age", "86400");
  return headers;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: createCorsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: new Headers({
        "content-type": "application/json",
        ...Object.fromEntries(createCorsHeaders(origin).entries()),
      }),
    });
  }

  const upstreamUrl = Deno.env.get("UPSTREAM_GRAPHQL_URL") || undefined;

  if (!upstreamUrl) {
    return new Response(
      JSON.stringify({ error: "UPSTREAM_GRAPHQL_URL is not configured" }),
      {
        status: 500,
        headers: new Headers({
          "content-type": "application/json",
          ...Object.fromEntries(createCorsHeaders(origin).entries()),
        }),
      },
    );
  }

  const incomingAuth = req.headers.get("authorization");

  const outboundHeaders = new Headers();
  outboundHeaders.set("content-type", "application/json");
  if (incomingAuth) {
    outboundHeaders.set("authorization", incomingAuth);
  }

  const bodyText = await req.text();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: outboundHeaders,
      body: bodyText,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream fetch failed", details: String(err) }), {
      status: 502,
      headers: new Headers({
        "content-type": "application/json",
        ...Object.fromEntries(createCorsHeaders(origin).entries()),
      }),
    });
  }

  const responseHeaders = new Headers(upstreamResponse.headers);
  createCorsHeaders(origin).forEach((value, key) => responseHeaders.set(key, value));

  return new Response(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
});