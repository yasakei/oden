const listener = Oden.listen({ port: 8080 });

for await (const conn of listener) {
  handleConn(conn);
}

function handleConn(conn: Oden.Conn) {
  const httpConn = (Oden as any).serveHttp(conn);
  for await (const event of httpConn) {
    event.respondWith(new Response("html", { status: 200 }));
  }
}
