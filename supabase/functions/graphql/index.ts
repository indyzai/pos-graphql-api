// Supabase Edge Function: proxy to Supabase GraphQL service
// Expects environment variables:
// - SUPABASE_URL (e.g., https://<project-ref>.supabase.co)
// - SUPABASE_ANON_KEY (public anon key)
// Optionally:
// - SUPABASE_GRAPHQL_URL (override, defaults to `${SUPABASE_URL}/graphql/v1`)
// - SUPABASE_SERVICE_ROLE_KEY (if you choose to force server-side privileges; not used by default)

function createCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();
  headers.set("access-control-allow-origin", origin ?? "*");
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("access-control-allow-headers", "authorization, apikey, content-type");
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const graphqlUrl = Deno.env.get("SUPABASE_GRAPHQL_URL") || (supabaseUrl ? `${supabaseUrl}/graphql/v1` : undefined);

  if (!graphqlUrl || !anonKey) {
    return new Response(
      JSON.stringify({ error: "Missing required env: SUPABASE_URL (or SUPABASE_GRAPHQL_URL) and SUPABASE_ANON_KEY" }),
      {
        status: 500,
        headers: new Headers({
          "content-type": "application/json",
          ...Object.fromEntries(createCorsHeaders(origin).entries()),
        }),
      },
    );
  }

  // Prefer passing through the client's Authorization if provided; fallback to anon.
  const incomingAuth = req.headers.get("authorization");
  const authorization = incomingAuth || `Bearer ${anonKey}`;

  const outboundHeaders = new Headers();
  outboundHeaders.set("content-type", "application/json");
  outboundHeaders.set("apikey", anonKey);
  outboundHeaders.set("authorization", authorization);

  // Forward the raw request body to avoid JSON re-parse/re-stringify overhead
  const bodyText = await req.text();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(graphqlUrl, {
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