// Test that X_ODEN_FETCH_TOKEN and CDN_LOOP env vars are injected as headers
// on outbound fetch requests, and that user-provided x-oden-fetch-token is
// scrubbed.

const server = Oden.serve({ port: 0 }, (req: Request) => {
  return Response.json({
    "x-oden-fetch-token": req.headers.get("x-oden-fetch-token"),
    "cdn-loop": req.headers.get("cdn-loop"),
  });
});

const addr = server.addr;
const url = `http://localhost:${addr.port}/`;

// Test 1: Headers are injected from env vars
{
  const resp = await fetch(url);
  const headers = await resp.json();
  console.log(
    "fetch token set:",
    headers["x-oden-fetch-token"] === "test-fetch-token-123",
  );
  console.log(
    "cdn-loop set:",
    headers["cdn-loop"] === "us-east-1.example.oden-cluster.net",
  );
}

// Test 2: User-provided x-oden-fetch-token is scrubbed and replaced
{
  const resp = await fetch(url, {
    headers: { "x-oden-fetch-token": "user-spoofed-value" },
  });
  const headers = await resp.json();
  console.log(
    "spoofed token scrubbed:",
    headers["x-oden-fetch-token"] === "test-fetch-token-123",
  );
}

await server.shutdown();
