const listener = Oden.listenTls({
  port: Number(Oden.args[0]),
  cert: Oden.readTextFileSync("./tls/localhost.crt"),
  key: Oden.readTextFileSync("./tls/localhost.key"),
  alpnProtocols: ["h2", "http/1.1", "foobar"],
});

console.log("READY");

const conn = await listener.accept() as Oden.TlsConn;
await conn.handshake();
conn.close();

listener.close();
