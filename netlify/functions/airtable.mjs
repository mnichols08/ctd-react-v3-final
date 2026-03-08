// ---------------------------------------------------------------------------
// Netlify serverless proxy for Airtable API
// ---------------------------------------------------------------------------
// Keeps the Airtable PAT out of the client bundle. The browser calls
//   /.netlify/functions/airtable
// and this function forwards the request to the Airtable REST API using
// server-side env vars that are never shipped to the browser.
//
// Required Netlify environment variables (set in Site → Environment):
//   AIRTABLE_PAT        – Personal Access Token (no VITE_ prefix!)
//   AIRTABLE_BASE_ID    – e.g. appXXXXXXXXXXXXXX
//   AIRTABLE_TABLE_NAME – e.g. "Kitchen Inventory"
//
// The client sends:
//   POST /.netlify/functions/airtable
//   Body: { method, recordId?, params?, body? }
//
// The function builds the real Airtable URL, attaches the PAT, forwards the
// request, and returns the Airtable response as-is.
// ---------------------------------------------------------------------------

const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

export default async (req) => {
  // Only accept POST from the client (the body carries the real method)
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Read server-side env vars (never exposed to the browser) ----------
  const { AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return new Response(
      JSON.stringify({
        error: "Server misconfigured — missing Airtable env vars",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Parse the client payload -----------------------------------------
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { method, recordId, params, body } = payload;

  if (!method || !ALLOWED_METHODS.has(method)) {
    return new Response(
      JSON.stringify({ error: `Invalid method: ${method}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Build the Airtable URL -------------------------------------------
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
  let url = recordId ? `${baseUrl}/${encodeURIComponent(recordId)}` : baseUrl;

  if (params) {
    url += `?${params}`;
  }

  // --- Forward to Airtable ----------------------------------------------
  const headers = {
    Authorization: `Bearer ${AIRTABLE_PAT}`,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  let airtableResp;
  try {
    airtableResp = await fetch(url, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "Network error: Unable to reach Airtable from the server.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Relay the Airtable response back to the client --------------------
  const responseBody = await airtableResp.text();
  return new Response(responseBody, {
    status: airtableResp.status,
    headers: { "Content-Type": "application/json" },
  });
};
