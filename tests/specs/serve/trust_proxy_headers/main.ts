// With ODEN_TRUST_PROXY_HEADERS=1, the x-oden-client-address request header
// overrides the remote address reported to the handler and is stripped from
// the request headers.
const server = Oden.serve(
  { port: 0, onListen: () => {} },
  (req, info) => {
    console.log("remoteAddr:", JSON.stringify(info.remoteAddr));
    console.log(
      "header visible:",
      req.headers.has("x-oden-client-address"),
    );
    return new Response("ok");
  },
);

const res = await fetch(`http://127.0.0.1:${server.addr.port}/`, {
  headers: { "x-oden-client-address": "10.1.2.3:4567" },
});
await res.body?.cancel();
console.log(
  "environment after first request:",
  Oden.env.get("ODEN_TRUST_PROXY_HEADERS"),
);

// A request with a body exercises the streaming/prebuffered raw record
// construction paths as well.
const res2 = await fetch(`http://127.0.0.1:${server.addr.port}/`, {
  method: "POST",
  body: "hello",
  headers: { "x-oden-client-address": "10.1.2.3:4567" },
});
await res2.body?.cancel();

await server.shutdown();
