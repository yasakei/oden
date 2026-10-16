// Copyright 2018-2026 the Oden authors. MIT license.

import { assert, assertEquals } from "./test_util.ts";

const cert = Oden.readTextFileSync("tests/testdata/tls/localhost.crt");
const key = Oden.readTextFileSync("tests/testdata/tls/localhost.key");
const caCerts = [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")];

interface Pair {
  server: Oden.QuicConn;
  client: Oden.QuicConn;
  endpoint: Oden.QuicEndpoint;
}

function trackedStreamResourceCount(conn: Oden.QuicConn): number {
  // @ts-ignore Oden.internal is available to the unit test suite.
  return Oden[Oden.internal].getQuicStreamResourceCount(conn);
}

async function pair(opt?: Oden.QuicTransportOptions): Promise<Pair> {
  const endpoint = new Oden.QuicEndpoint({ hostname: "localhost" });
  const listener = endpoint.listen({
    cert,
    key,
    alpnProtocols: ["oden-test"],
    ...opt,
  });
  assertEquals(endpoint, listener.endpoint);

  const [server, client] = await Promise.all([
    listener.accept(),
    Oden.connectQuic({
      hostname: "localhost",
      port: endpoint.addr.port,
      caCerts,
      alpnProtocols: ["oden-test"],
      ...opt,
    }),
  ]);

  assertEquals(server.protocol, "oden-test");
  assertEquals(client.protocol, "oden-test");
  assertEquals(client.remoteAddr, endpoint.addr);
  assertEquals(server.serverName, "localhost");

  return { server, client, endpoint };
}

Oden.test("bidirectional stream", async () => {
  const { server, client, endpoint } = await pair();

  const encoded = (new TextEncoder()).encode("hi!");

  {
    const bi = await server.createBidirectionalStream({ sendOrder: 42 });
    assertEquals(bi.writable.sendOrder, 42);
    bi.writable.sendOrder = 0;
    assertEquals(bi.writable.sendOrder, 0);
    await bi.writable.getWriter().write(encoded);
  }

  {
    const { value: bi } = await client.incomingBidirectionalStreams
      .getReader()
      .read();
    const { value: data } = await bi!.readable.getReader().read();
    assertEquals(data, encoded);
  }

  client.close();
  endpoint.close();
});

Oden.test("unidirectional stream", async () => {
  const { server, client, endpoint } = await pair();

  const encoded = (new TextEncoder()).encode("hi!");

  {
    const uni = await server.createUnidirectionalStream({ sendOrder: 42 });
    assertEquals(uni.sendOrder, 42);
    uni.sendOrder = 0;
    assertEquals(uni.sendOrder, 0);
    await uni.getWriter().write(encoded);
  }

  {
    const { value: uni } = await client.incomingUnidirectionalStreams
      .getReader()
      .read();
    const { value: data } = await uni!.getReader().read();
    assertEquals(data, encoded);
  }

  endpoint.close();
  client.close();
});

Oden.test("completed streams release connection cleanup state", async () => {
  const { server, client, endpoint } = await pair();

  const bi = await server.createBidirectionalStream();
  assertEquals(trackedStreamResourceCount(server), 2);
  await Promise.all([bi.readable.cancel(), bi.writable.close()]);
  assertEquals(trackedStreamResourceCount(server), 0);

  const uni = await server.createUnidirectionalStream();
  assertEquals(trackedStreamResourceCount(server), 1);
  await uni.close();
  assertEquals(trackedStreamResourceCount(server), 0);

  await server.createBidirectionalStream();
  assertEquals(trackedStreamResourceCount(server), 2);
  server.close();
  await server.closed;
  assertEquals(trackedStreamResourceCount(server), 0);

  await client.closed;
  endpoint.close();
});

Oden.test("datagrams", async () => {
  const { server, client, endpoint } = await pair();

  const encoded = (new TextEncoder()).encode("hi!");

  await server.sendDatagram(encoded);

  const data = await client.readDatagram();
  assertEquals(data, encoded);

  endpoint.close();
  client.close();
});

Oden.test("closing", async () => {
  const { server, client } = await pair();

  server.close({ closeCode: 42, reason: "hi!" });

  assertEquals(await client.closed, { closeCode: 42, reason: "hi!" });
});

Oden.test("max concurrent streams", async () => {
  const { server, client, endpoint } = await pair({
    maxConcurrentBidirectionalStreams: 1,
    maxConcurrentUnidirectionalStreams: 1,
  });

  {
    await server.createBidirectionalStream();
    await server.createBidirectionalStream()
      .then(() => {
        throw new Error("expected failure");
      }, () => {
        // success!
      });
  }

  {
    await server.createUnidirectionalStream();
    await server.createUnidirectionalStream()
      .then(() => {
        throw new Error("expected failure");
      }, () => {
        // success!
      });
  }

  endpoint.close();
  client.close();
});

Oden.test("incoming", async () => {
  const endpoint = new Oden.QuicEndpoint({ hostname: "localhost" });
  const listener = endpoint.listen({
    cert,
    key,
    alpnProtocols: ["oden-test"],
  });

  const connect = () =>
    Oden.connectQuic({
      hostname: "localhost",
      port: endpoint.addr.port,
      caCerts,
      alpnProtocols: ["oden-test"],
    });

  const c1p = connect();
  const i1 = await listener.incoming();
  const server = await i1.accept();
  const client = await c1p;

  assertEquals(server.protocol, "oden-test");
  assertEquals(client.protocol, "oden-test");
  assertEquals(client.remoteAddr, endpoint.addr);

  endpoint.close();
  client.close();
});

Oden.test("0rtt", async () => {
  const sEndpoint = new Oden.QuicEndpoint({ hostname: "localhost" });
  const listener = sEndpoint.listen({
    cert,
    key,
    alpnProtocols: ["oden-test"],
  });

  (async () => {
    while (true) {
      let incoming;
      try {
        incoming = await listener.incoming();
      } catch (e) {
        if (e instanceof Oden.errors.BadResource) {
          break;
        }
        throw e;
      }
      const conn = incoming.accept({ zeroRtt: true });
      conn.handshake.then(() => {
        conn.close();
      });
    }
  })();

  const endpoint = new Oden.QuicEndpoint();

  const c1 = await Oden.connectQuic({
    hostname: "localhost",
    port: sEndpoint.addr.port,
    caCerts,
    alpnProtocols: ["oden-test"],
    endpoint,
  });

  await c1.closed;

  const c2 = Oden.connectQuic({
    hostname: "localhost",
    port: sEndpoint.addr.port,
    caCerts,
    alpnProtocols: ["oden-test"],
    zeroRtt: true,
    endpoint,
  });

  assert(!(c2 instanceof Promise), "0rtt should be accepted");

  await c2.closed;

  sEndpoint.close();
  endpoint.close();
});
