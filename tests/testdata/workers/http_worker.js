// Copyright 2018-2026 the Oden authors. MIT license.

// deno-lint-ignore-file no-deprecated-oden-api

const listener = Oden.listen({ hostname: "127.0.0.1", port: 4506 });
postMessage("ready");
for await (const conn of listener) {
  (async () => {
    // @ts-ignore `Oden.serveHttp()` was soft-removed in Oden 2.
    const requests = Oden.serveHttp(conn);
    for await (const { respondWith } of requests) {
      respondWith(new Response("Hello world"));
    }
  })();
}
