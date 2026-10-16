const listener = Oden.listen({
  port: Number(Oden.args[0]),
});

console.log("READY");

for await (const conn of listener) {
  // @ts-ignore `Oden.serveHttp()` was soft-removed in Oden 2.
  for await (const { request, respondWith } of Oden.serveHttp(conn)) {
    const href = new URL(request.url).href;
    respondWith(new Response(href));
  }
}
