import { copy } from "@std/io/copy";
const addr = Oden.args[0] || "0.0.0.0:4544";
const [hostname, port] = addr.split(":");
const listener = Oden.listen({ hostname, port: Number(port) });
console.log("listening on", addr);
listener.accept().then(
  async (conn) => {
    console.log("received bytes:", await copy(conn, conn));
    conn.close();
    listener.close();
  },
);
