const { promise, resolve } = Promise.withResolvers<void>();
const listener = Oden.listen({ port: 4319 });
console.log("READY");
const conn = await listener.accept();
// @ts-ignore `Oden.serveHttp()` was soft-removed in Oden 2.
const httpConn = Oden.serveHttp(conn);
const { request, respondWith } = (await httpConn.nextRequest())!;
const {
  response,
  socket,
} = Oden.upgradeWebSocket(request);
socket.onerror = () => Oden.exit(1);
socket.onopen = () => socket.close();
socket.onclose = () => resolve();
await respondWith(response);
await promise;
