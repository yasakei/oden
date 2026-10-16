// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
  BufReader,
  BufWriter,
} from "./test_util.ts";
import { readAll } from "@std/io/read-all";
import { writeAll } from "@std/io/write-all";
import { TextProtoReader } from "../testdata/run/textproto.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const cert = Oden.readTextFileSync("tests/testdata/tls/localhost.crt");
const key = Oden.readTextFileSync("tests/testdata/tls/localhost.key");
const caCerts = [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")];

async function sleep(msec: number) {
  await new Promise((res, _rej) => setTimeout(res, msec));
}

function listenTls(
  options?: {
    alpnProtocols?: string[];
    reusePort?: boolean;
    cert?: string;
    key?: string;
  },
): { listener: Oden.TlsListener; port: number; hostname: string } {
  const tlsOptions = { port: 0, hostname: "localhost", cert, key, ...options };
  const listener = Oden.listenTls(tlsOptions);
  return {
    listener,
    port: (<Oden.NetAddr> listener.addr).port,
    hostname: "localhost",
  };
}

function listenTcp(): {
  listener: Oden.Listener;
  port: number;
  hostname: string;
} {
  const listener = Oden.listen({ port: 0, hostname: "localhost" });
  return {
    listener,
    port: (<Oden.NetAddr> listener.addr).port,
    hostname: "localhost",
  };
}

function unreachable(): never {
  throw new Error("Unreachable code reached");
}

Oden.test({ permissions: { net: false } }, async function connectTLSNoPerm() {
  await assertRejects(async () => {
    await Oden.connectTls({ hostname: "deno.land", port: 443 });
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectTLSInvalidHost() {
    await assertRejects(async () => {
      await Oden.connectTls({ hostname: "256.0.0.0", port: 3567 });
    }, TypeError);
  },
);

Oden.test(
  { permissions: { net: true } },
  async function startTlsWithoutExclusiveAccessToTcpConn() {
    const { listener, hostname, port } = listenTcp();
    const [serverConn, clientConn] = await Promise.all([
      listener.accept(),
      Oden.connect({ hostname, port }),
    ]);

    const buf = new Uint8Array(128);
    const readPromise = clientConn.read(buf);
    // `clientConn` is being used by a pending promise (`readPromise`) so
    // `Oden.startTls` cannot consume the connection.
    await assertRejects(
      () => Oden.startTls(clientConn, { hostname }),
      Oden.errors.Busy,
    );

    serverConn.close();
    listener.close();
    await readPromise;
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function dialAndListenTLS() {
    const { promise, resolve } = Promise.withResolvers<void>();
    const { listener, port, hostname } = listenTls();

    const response = encoder.encode(
      "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );

    listener.accept().then(
      async (conn) => {
        assert(conn.remoteAddr != null);
        assert(conn.localAddr != null);
        await conn.write(response);
        // TODO(bartlomieju): this might be a bug
        setTimeout(() => {
          conn.close();
          resolve();
        }, 0);
      },
    );

    const conn = await Oden.connectTls({ hostname, port, caCerts });
    const w = new BufWriter(conn);
    const r = new BufReader(conn);
    const body = `GET / HTTP/1.1\r\nHost: ${hostname}:${port}\r\n\r\n`;
    const writeResult = await w.write(encoder.encode(body));
    assertEquals(body.length, writeResult);
    await w.flush();
    const tpr = new TextProtoReader(r);
    const statusLine = await tpr.readLine();
    assert(statusLine !== null, `line must be read: ${String(statusLine)}`);
    const m = statusLine.match(/^(.+?) (.+?) (.+?)$/);
    assert(m !== null, "must be matched");
    const [_, proto, status, ok] = m;
    assertEquals(proto, "HTTP/1.1");
    assertEquals(status, "200");
    assertEquals(ok, "OK");
    const headers = await tpr.readMimeHeader();
    assert(headers !== null);
    const contentLength = parseInt(headers.get("content-length")!);
    const bodyBuf = new Uint8Array(contentLength);
    await r.readFull(bodyBuf);
    assertEquals(decoder.decode(bodyBuf), "Hello World\n");
    conn.close();
    listener.close();
    await promise;
  },
);

Oden.test(
  { permissions: { read: false, net: true } },
  async function listenTlsWithCertAndKey() {
    const { promise, resolve } = Promise.withResolvers<void>();

    const { listener, hostname, port } = listenTls();

    const response = encoder.encode(
      "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );

    listener.accept().then(
      async (conn) => {
        assert(conn.remoteAddr != null);
        assert(conn.localAddr != null);
        await conn.write(response);
        setTimeout(() => {
          conn.close();
          resolve();
        }, 0);
      },
    );

    const conn = await Oden.connectTls({ hostname, port, caCerts });
    const w = new BufWriter(conn);
    const r = new BufReader(conn);
    const body = `GET / HTTP/1.1\r\nHost: ${hostname}:${port}\r\n\r\n`;
    const writeResult = await w.write(encoder.encode(body));
    assertEquals(body.length, writeResult);
    await w.flush();
    const tpr = new TextProtoReader(r);
    const statusLine = await tpr.readLine();
    assert(statusLine !== null, `line must be read: ${String(statusLine)}`);
    const m = statusLine.match(/^(.+?) (.+?) (.+?)$/);
    assert(m !== null, "must be matched");
    const [_, proto, status, ok] = m;
    assertEquals(proto, "HTTP/1.1");
    assertEquals(status, "200");
    assertEquals(ok, "OK");
    const headers = await tpr.readMimeHeader();
    assert(headers !== null);
    const contentLength = parseInt(headers.get("content-length")!);
    const bodyBuf = new Uint8Array(contentLength);
    await r.readFull(bodyBuf);
    assertEquals(decoder.decode(bodyBuf), "Hello World\n");
    conn.close();
    listener.close();
    await promise;
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHostnameVerification() {
    const { promise, resolve } = Promise.withResolvers<void>();

    const selfCert = Oden.readTextFileSync(
      "tests/testdata/tls/self-signed-hostname.crt",
    );
    const selfKey = Oden.readTextFileSync(
      "tests/testdata/tls/self-signed-hostname.key",
    );
    const { listener, hostname, port } = listenTls({
      cert: selfCert,
      key: selfKey,
    });

    listener.accept().then(
      (conn) => {
        assert(conn.remoteAddr != null);
        assert(conn.localAddr != null);
        setTimeout(() => {
          conn.close();
          resolve();
        }, 0);
      },
    );

    const conn = await Oden.connectTls({
      hostname: "localhost",
      port,
      caCerts: [selfCert],
      unsafelyDisableHostnameVerification: false,
    });

    const w = new BufWriter(conn);
    const body = `GET / HTTP/1.1\r\nHost: ${hostname}:${port}\r\n\r\n`;
    await assertRejects(
      async () => {
        await w.write(encoder.encode(body));
        await w.flush();
      },
      Oden.errors.InvalidData,
      'certificate not valid for name "localhost"; certificate is only valid for DnsName("valid.example.com")',
    );
    // Closie
    conn.close();
    listener.close();
    await promise;
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsDisableHostnameVerification() {
    const { promise, resolve } = Promise.withResolvers<void>();

    const selfCert = Oden.readTextFileSync(
      "tests/testdata/tls/self-signed-hostname.crt",
    );
    const selfKey = Oden.readTextFileSync(
      "tests/testdata/tls/self-signed-hostname.key",
    );
    const { listener, hostname, port } = listenTls({
      cert: selfCert,
      key: selfKey,
    });

    const response = encoder.encode(
      "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );

    listener.accept().then(
      async (conn) => {
        assert(conn.remoteAddr != null);
        assert(conn.localAddr != null);
        await conn.write(response);
        setTimeout(() => {
          conn.close();
          resolve();
        }, 0);
      },
    );

    const conn = await Oden.connectTls({
      hostname: "localhost",
      port,
      caCerts: [selfCert],
      unsafelyDisableHostnameVerification: true,
    });

    const w = new BufWriter(conn);
    const r = new BufReader(conn);
    const body = `GET / HTTP/1.1\r\nHost: ${hostname}:${port}\r\n\r\n`;
    const writeResult = await w.write(encoder.encode(body));
    assertEquals(body.length, writeResult);
    await w.flush();
    const tpr = new TextProtoReader(r);
    const statusLine = await tpr.readLine();
    assert(statusLine !== null, `line must be read: ${String(statusLine)}`);
    const m = statusLine.match(/^(.+?) (.+?) (.+?)$/);
    assert(m !== null, "must be matched");
    const [_, proto, status, ok] = m;
    assertEquals(proto, "HTTP/1.1");
    assertEquals(status, "200");
    assertEquals(ok, "OK");
    const headers = await tpr.readMimeHeader();
    assert(headers !== null);
    const contentLength = parseInt(headers.get("content-length")!);
    const bodyBuf = new Uint8Array(contentLength);
    await r.readFull(bodyBuf);
    assertEquals(decoder.decode(bodyBuf), "Hello World\n");
    conn.close();
    listener.close();
    await promise;
  },
);

async function tlsPair(): Promise<[Oden.Conn, Oden.Conn]> {
  const { listener, hostname, port } = listenTls();

  const acceptPromise = listener.accept();
  const connectPromise = Oden.connectTls({
    hostname,
    port,
    caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
  });
  const endpoints = await Promise.all([acceptPromise, connectPromise]);

  listener.close();

  return endpoints;
}

async function tlsAlpn(
  useStartTls: boolean,
): Promise<[Oden.TlsConn, Oden.TlsConn]> {
  const { listener, port } = listenTls({
    alpnProtocols: ["oden", "rocks"],
  });

  const acceptPromise = listener.accept();

  const caCerts = [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")];
  const clientAlpnProtocols = ["rocks", "rises"];
  let endpoints: [Oden.TlsConn, Oden.TlsConn];

  if (!useStartTls) {
    const connectPromise = Oden.connectTls({
      hostname: "localhost",
      port,
      caCerts,
      alpnProtocols: clientAlpnProtocols,
    });
    endpoints = await Promise.all([acceptPromise, connectPromise]);
  } else {
    const client = await Oden.connect({
      hostname: "localhost",
      port,
    });
    const connectPromise = Oden.startTls(client, {
      hostname: "localhost",
      caCerts,
      alpnProtocols: clientAlpnProtocols,
    });
    endpoints = await Promise.all([acceptPromise, connectPromise]);
  }

  listener.close();
  return endpoints;
}

async function sendThenCloseWriteThenReceive(
  conn: Oden.Conn,
  chunkCount: number,
  chunkSize: number,
) {
  const byteCount = chunkCount * chunkSize;
  const buf = new Uint8Array(chunkSize); // Note: buf is size of _chunk_.
  let n: number;

  // Slowly send 42s.
  buf.fill(42);
  for (let remaining = byteCount; remaining > 0; remaining -= n) {
    n = await conn.write(buf.subarray(0, remaining));
    assert(n >= 1);
    await sleep(10);
  }

  // Send EOF.
  await conn.closeWrite();

  // Receive 69s.
  for (let remaining = byteCount; remaining > 0; remaining -= n) {
    buf.fill(0);
    n = await conn.read(buf) as number;
    assert(n >= 1);
    assertStrictEquals(buf[0], 69);
    assertStrictEquals(buf[n - 1], 69);
  }

  conn.close();
}

async function receiveThenSend(
  conn: Oden.Conn,
  chunkCount: number,
  chunkSize: number,
) {
  const byteCount = chunkCount * chunkSize;
  const buf = new Uint8Array(byteCount); // Note: buf size equals `byteCount`.
  let n: number;

  // Receive 42s.
  for (let remaining = byteCount; remaining > 0; remaining -= n) {
    buf.fill(0);
    n = await conn.read(buf) as number;
    assert(n >= 1);
    assertStrictEquals(buf[0], 42);
    assertStrictEquals(buf[n - 1], 42);
  }

  // Slowly send 69s.
  buf.fill(69);
  for (let remaining = byteCount; remaining > 0; remaining -= n) {
    n = await conn.write(buf.subarray(0, remaining));
    assert(n >= 1);
    await sleep(10);
  }

  conn.close();
}

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerAlpnListenConnect() {
    const [serverConn, clientConn] = await tlsAlpn(false);
    const [serverHS, clientHS] = await Promise.all([
      serverConn.handshake(),
      clientConn.handshake(),
    ]);
    assertStrictEquals(serverHS.alpnProtocol, "rocks");
    assertStrictEquals(clientHS.alpnProtocol, "rocks");

    serverConn.close();
    clientConn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerAlpnListenStartTls() {
    const [serverConn, clientConn] = await tlsAlpn(true);
    const [serverHS, clientHS] = await Promise.all([
      serverConn.handshake(),
      clientConn.handshake(),
    ]);
    assertStrictEquals(serverHS.alpnProtocol, "rocks");
    assertStrictEquals(clientHS.alpnProtocol, "rocks");

    serverConn.close();
    clientConn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamHalfCloseSendOneByte() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(serverConn, 1, 1),
      receiveThenSend(clientConn, 1, 1),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamHalfCloseSendOneByte() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(clientConn, 1, 1),
      receiveThenSend(serverConn, 1, 1),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamHalfCloseSendOneChunk() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(serverConn, 1, 1 << 20 /* 1 MB */),
      receiveThenSend(clientConn, 1, 1 << 20 /* 1 MB */),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamHalfCloseSendOneChunk() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(clientConn, 1, 1 << 20 /* 1 MB */),
      receiveThenSend(serverConn, 1, 1 << 20 /* 1 MB */),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamHalfCloseSendManyBytes() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(serverConn, 100, 1),
      receiveThenSend(clientConn, 100, 1),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamHalfCloseSendManyBytes() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(clientConn, 100, 1),
      receiveThenSend(serverConn, 100, 1),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamHalfCloseSendManyChunks() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(serverConn, 100, 1 << 16 /* 64 kB */),
      receiveThenSend(clientConn, 100, 1 << 16 /* 64 kB */),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamHalfCloseSendManyChunks() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendThenCloseWriteThenReceive(clientConn, 100, 1 << 16 /* 64 kB */),
      receiveThenSend(serverConn, 100, 1 << 16 /* 64 kB */),
    ]);
  },
);

const largeAmount = 1 << 20 /* 1 MB */;

async function sendAlotReceiveNothing(conn: Oden.Conn) {
  // Start receive op.
  const readBuf = new Uint8Array(1024);
  const readPromise = conn.read(readBuf);

  const timeout = setTimeout(() => {
    throw new Error("Failed to send buffer in a reasonable amount of time");
  }, 10_000);

  // Send 1 MB of data.
  const writeBuf = new Uint8Array(largeAmount);
  writeBuf.fill(42);
  await writeAll(conn, writeBuf);

  clearTimeout(timeout);

  // Send EOF.
  await conn.closeWrite();

  // Close the connection.
  conn.close();

  // Read op should be canceled.
  await assertRejects(
    async () => await readPromise,
    Oden.errors.Interrupted,
  );
}

async function receiveAlotSendNothing(conn: Oden.Conn) {
  const readBuf = new Uint8Array(1024);
  let n: number | null;
  let nread = 0;

  const timeout = setTimeout(() => {
    throw new Error(
      `Failed to read buffer in a reasonable amount of time (got ${nread}/${largeAmount})`,
    );
  }, 10_000);

  // Receive 1 MB of data.
  try {
    for (; nread < largeAmount; nread += n!) {
      n = await conn.read(readBuf);
      assertStrictEquals(typeof n, "number");
      assert(n! > 0);
      assertStrictEquals(readBuf[0], 42);
    }
  } catch (e) {
    throw new Error(
      `Got an error (${
        (e as Error).message
      }) after reading ${nread}/${largeAmount} bytes`,
      { cause: e },
    );
  }
  clearTimeout(timeout);

  // Close the connection, without sending anything at all.
  conn.close();
}

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamCancelRead() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendAlotReceiveNothing(serverConn),
      receiveAlotSendNothing(clientConn),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamCancelRead() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendAlotReceiveNothing(clientConn),
      receiveAlotSendNothing(serverConn),
    ]);
  },
);

async function sendReceiveEmptyBuf(conn: Oden.Conn) {
  const byteBuf = new Uint8Array([1]);
  const emptyBuf = new Uint8Array(0);
  let n: number | null;

  n = await conn.write(emptyBuf);
  assertStrictEquals(n, 0);

  n = await conn.read(emptyBuf);
  assertStrictEquals(n, 0);

  n = await conn.write(byteBuf);
  assertStrictEquals(n, 1);

  n = await conn.read(byteBuf);
  assertStrictEquals(n, 1);

  await conn.closeWrite();

  n = await conn.write(emptyBuf);
  assertStrictEquals(n, 0);

  await assertRejects(async () => {
    await conn.write(byteBuf);
  }, Oden.errors.NotConnected);

  n = await conn.write(emptyBuf);
  assertStrictEquals(n, 0);

  n = await conn.read(byteBuf);
  assertStrictEquals(n, null);

  conn.close();
}

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsStreamSendReceiveEmptyBuf() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      sendReceiveEmptyBuf(serverConn),
      sendReceiveEmptyBuf(clientConn),
    ]);
  },
);

function immediateClose(conn: Oden.Conn) {
  conn.close();
  return Promise.resolve();
}

async function closeWriteAndClose(conn: Oden.Conn) {
  await conn.closeWrite();

  if (await conn.read(new Uint8Array(1)) !== null) {
    throw new Error("did not expect to receive data on TLS stream");
  }

  conn.close();
}

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsServerStreamImmediateClose() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      immediateClose(serverConn),
      closeWriteAndClose(clientConn),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientStreamImmediateClose() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      closeWriteAndClose(serverConn),
      immediateClose(clientConn),
    ]);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsClientAndServerStreamImmediateClose() {
    const [serverConn, clientConn] = await tlsPair();
    await Promise.all([
      immediateClose(serverConn),
      immediateClose(clientConn),
    ]);
  },
);

async function tlsWithTcpFailureTestImpl(
  phase: "handshake" | "traffic",
  cipherByteCount: number,
  failureMode: "corruption" | "shutdown",
  reverse: boolean,
) {
  const tls = listenTls();
  const tcp = listenTcp();

  const [tlsServerConn, tcpServerConn] = await Promise.all([
    tls.listener.accept(),
    Oden.connect({ hostname: tls.hostname, port: tls.port }),
  ]);

  const [tcpClientConn, tlsClientConn] = await Promise.all([
    tcp.listener.accept(),
    Oden.connectTls({
      hostname: tcp.hostname,
      port: tcp.port,
      caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
    }),
  ]);

  tls.listener.close();
  tcp.listener.close();

  const {
    tlsConn1,
    tlsConn2,
    tcpConn1,
    tcpConn2,
  } = reverse
    ? {
      tlsConn1: tlsClientConn,
      tlsConn2: tlsServerConn,
      tcpConn1: tcpClientConn,
      tcpConn2: tcpServerConn,
    }
    : {
      tlsConn1: tlsServerConn,
      tlsConn2: tlsClientConn,
      tcpConn1: tcpServerConn,
      tcpConn2: tcpClientConn,
    };

  const tcpForwardingInterruptDeferred1 = Promise.withResolvers<void>();
  const tcpForwardingPromise1 = forwardBytes(
    tcpConn2,
    tcpConn1,
    cipherByteCount,
    tcpForwardingInterruptDeferred1,
  );

  const tcpForwardingInterruptDeferred2 = Promise.withResolvers<void>();
  const tcpForwardingPromise2 = forwardBytes(
    tcpConn1,
    tcpConn2,
    Infinity,
    tcpForwardingInterruptDeferred2,
  );

  switch (phase) {
    case "handshake": {
      let expectedError;
      switch (failureMode) {
        case "corruption":
          expectedError = Oden.errors.InvalidData;
          break;
        case "shutdown":
          expectedError = Oden.errors.UnexpectedEof;
          break;
        default:
          unreachable();
      }

      const tlsTrafficPromise1 = Promise.all([
        assertRejects(
          () => sendBytes(tlsConn1, 0x01, 1),
          expectedError,
        ),
        assertRejects(
          () => receiveBytes(tlsConn1, 0x02, 1),
          expectedError,
        ),
      ]);

      const tlsTrafficPromise2 = Promise.all([
        assertRejects(
          () => sendBytes(tlsConn2, 0x02, 1),
          Oden.errors.UnexpectedEof,
        ),
        assertRejects(
          () => receiveBytes(tlsConn2, 0x01, 1),
          Oden.errors.UnexpectedEof,
        ),
      ]);

      await tcpForwardingPromise1;

      switch (failureMode) {
        case "corruption":
          await sendBytes(tcpConn1, 0xff, 1 << 14 /* 16 kB */);
          break;
        case "shutdown":
          await tcpConn1.closeWrite();
          break;
        default:
          unreachable();
      }
      await tlsTrafficPromise1;

      tcpForwardingInterruptDeferred2.resolve();
      await tcpForwardingPromise2;
      await tcpConn2.closeWrite();
      await tlsTrafficPromise2;

      break;
    }

    case "traffic": {
      await Promise.all([
        sendBytes(tlsConn2, 0x88, 8888),
        receiveBytes(tlsConn1, 0x88, 8888),
        sendBytes(tlsConn1, 0x99, 99999),
        receiveBytes(tlsConn2, 0x99, 99999),
      ]);

      tcpForwardingInterruptDeferred1.resolve();
      await tcpForwardingInterruptDeferred1.promise;

      switch (failureMode) {
        case "corruption":
          await sendBytes(tcpConn1, 0xff, 1 << 14 /* 16 kB */);
          await assertRejects(
            () => receiveEof(tlsConn1),
            Oden.errors.InvalidData,
          );
          tcpForwardingInterruptDeferred2.resolve();
          break;
        case "shutdown":
          await Promise.all([
            tcpConn1.closeWrite(),
            await assertRejects(
              () => receiveEof(tlsConn1),
              Oden.errors.UnexpectedEof,
            ),
            await tlsConn1.closeWrite(),
            await receiveEof(tlsConn2),
          ]);
          break;
        default:
          unreachable();
      }

      await tcpForwardingPromise2;

      break;
    }

    default:
      unreachable();
  }

  tlsServerConn.close();
  tlsClientConn.close();
  tcpServerConn.close();
  tcpClientConn.close();

  async function sendBytes(
    conn: Oden.Conn,
    byte: number,
    count: number,
  ) {
    let buf = new Uint8Array(1 << 12 /* 4 kB */);
    buf.fill(byte);

    while (count > 0) {
      buf = buf.subarray(0, Math.min(buf.length, count));
      const nwritten = await conn.write(buf);
      assertStrictEquals(nwritten, buf.length);
      count -= nwritten;
    }
  }

  async function receiveBytes(
    conn: Oden.Conn,
    byte: number,
    count: number,
  ) {
    let buf = new Uint8Array(1 << 12 /* 4 kB */);
    while (count > 0) {
      buf = buf.subarray(0, Math.min(buf.length, count));
      const r = await conn.read(buf);
      assertNotEquals(r, null);
      assert(buf.subarray(0, r!).every((b) => b === byte));
      count -= r!;
    }
  }

  async function receiveEof(conn: Oden.Conn) {
    const buf = new Uint8Array(1);
    const r = await conn.read(buf);
    assertStrictEquals(r, null);
  }

  async function forwardBytes(
    source: Oden.Conn,
    sink: Oden.Conn,
    count: number,
    interruptPromise: ReturnType<typeof Promise.withResolvers<void>>,
  ) {
    let buf = new Uint8Array(1 << 12 /* 4 kB */);
    while (count > 0) {
      buf = buf.subarray(0, Math.min(buf.length, count));
      const nread = await Promise.race([
        source.read(buf),
        interruptPromise.promise,
      ]);
      if (nread == null) break; // Either EOF or interrupted.
      const nwritten = await sink.write(buf.subarray(0, nread));
      assertStrictEquals(nread, nwritten);
      count -= nwritten;
    }
  }
}

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpCorruptionImmediately() {
    await tlsWithTcpFailureTestImpl("handshake", 0, "corruption", false);
    await tlsWithTcpFailureTestImpl("handshake", 0, "corruption", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpShutdownImmediately() {
    await tlsWithTcpFailureTestImpl("handshake", 0, "shutdown", false);
    await tlsWithTcpFailureTestImpl("handshake", 0, "shutdown", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpCorruptionAfter70Bytes() {
    await tlsWithTcpFailureTestImpl("handshake", 76, "corruption", false);
    await tlsWithTcpFailureTestImpl("handshake", 78, "corruption", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpShutdownAfter70bytes() {
    await tlsWithTcpFailureTestImpl("handshake", 77, "shutdown", false);
    await tlsWithTcpFailureTestImpl("handshake", 79, "shutdown", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpCorruptionAfter200Bytes() {
    await tlsWithTcpFailureTestImpl("handshake", 200, "corruption", false);
    await tlsWithTcpFailureTestImpl("handshake", 202, "corruption", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeWithTcpShutdownAfter200bytes() {
    await tlsWithTcpFailureTestImpl("handshake", 201, "shutdown", false);
    await tlsWithTcpFailureTestImpl("handshake", 203, "shutdown", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsTrafficWithTcpCorruption() {
    await tlsWithTcpFailureTestImpl("traffic", Infinity, "corruption", false);
    await tlsWithTcpFailureTestImpl("traffic", Infinity, "corruption", true);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsTrafficWithTcpShutdown() {
    await tlsWithTcpFailureTestImpl("traffic", Infinity, "shutdown", false);
    await tlsWithTcpFailureTestImpl("traffic", Infinity, "shutdown", true);
  },
);

function createHttpsListener(): {
  listener: Oden.TlsListener;
  hostname: string;
  port: number;
} {
  // Query format: `curl --insecure https://localhost:8443/z/12345`
  // The server returns a response consisting of 12345 times the letter 'z'.
  const { listener, hostname, port } = listenTls();

  serve(listener);
  return { listener, hostname, port };

  async function serve(listener: Oden.Listener) {
    for await (const conn of listener) {
      const EOL = "\r\n";

      // Read GET request plus headers.
      const buf = new Uint8Array(1 << 12 /* 4 kB */);
      const decoder = new TextDecoder();
      let req = "";
      while (!req.endsWith(EOL + EOL)) {
        const n = await conn.read(buf);
        if (n === null) throw new Error("Unexpected EOF");
        req += decoder.decode(buf.subarray(0, n));
      }

      // Parse GET request.
      const { filler, count, version } =
        /^GET \/(?<filler>[^\/]+)\/(?<count>\d+) HTTP\/(?<version>1\.\d)\r\n/
          .exec(req)!.groups as {
            filler: string;
            count: string;
            version: string;
          };

      // Generate response.
      const resBody = new TextEncoder().encode(filler.repeat(+count));
      const resHead = new TextEncoder().encode(
        [
          `HTTP/${version} 200 OK`,
          `Content-Length: ${resBody.length}`,
          "Content-Type: text/plain",
        ].join(EOL) + EOL + EOL,
      );

      // Send response.
      await writeAll(conn, resHead);
      await writeAll(conn, resBody);

      // Close TCP connection.
      conn.close();
    }
  }
}

async function curl(url: string): Promise<string> {
  const { success, code, stdout, stderr } = await new Oden.Command("curl", {
    args: ["--insecure", url],
  }).output();

  if (!success) {
    throw new Error(
      `curl ${url} failed: ${code}:\n${new TextDecoder().decode(stderr)}`,
    );
  }
  return new TextDecoder().decode(stdout);
}

Oden.test(
  { permissions: { read: true, net: true, run: true } },
  async function curlFakeHttpsServer() {
    const { listener, port } = createHttpsListener();

    const res1 = await curl(`https://localhost:${port}/d/1`);
    assertStrictEquals(res1, "d");

    const res2 = await curl(`https://localhost:${port}/e/12345`);
    assertStrictEquals(res2, "e".repeat(12345));

    const count3 = 1 << 17; // 128 kB.
    const res3 = await curl(`https://localhost:${port}/n/${count3}`);
    assertStrictEquals(res3, "n".repeat(count3));

    const count4 = 12345678;
    const res4 = await curl(`https://localhost:${port}/o/${count4}`);
    assertStrictEquals(res4, "o".repeat(count4));

    listener.close();
  },
);

Oden.test(
  // Ignored because gmail appears to reject us on CI sometimes
  { ignore: true, permissions: { read: true, net: true } },
  async function startTls() {
    const hostname = "smtp.gmail.com";
    const port = 587;
    const encoder = new TextEncoder();

    const conn = await Oden.connect({
      hostname,
      port,
    });

    let writer = new BufWriter(conn);
    let reader = new TextProtoReader(new BufReader(conn));

    let line: string | null = (await reader.readLine()) as string;
    assert(line.startsWith("220"));

    await writer.write(encoder.encode(`EHLO ${hostname}\r\n`));
    await writer.flush();

    while ((line = (await reader.readLine()) as string)) {
      assert(line.startsWith("250"));
      if (line.startsWith("250 ")) break;
    }

    await writer.write(encoder.encode("STARTTLS\r\n"));
    await writer.flush();

    line = await reader.readLine();

    // Received the message that the server is ready to establish TLS
    assertEquals(line, "220 2.0.0 Ready to start TLS");

    const tlsConn = await Oden.startTls(conn, { hostname });
    writer = new BufWriter(tlsConn);
    reader = new TextProtoReader(new BufReader(tlsConn));

    // After that use TLS communication again
    await writer.write(encoder.encode(`EHLO ${hostname}\r\n`));
    await writer.flush();

    while ((line = (await reader.readLine()) as string)) {
      assert(line.startsWith("250"));
      if (line.startsWith("250 ")) break;
    }

    tlsConn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectTLSBadCertKey(): Promise<void> {
    await assertRejects(async () => {
      await Oden.connectTls({
        hostname: "deno.land",
        port: 443,
        cert: "bad data",
        key: Oden.readTextFileSync(
          "tests/testdata/tls/localhost.key",
        ),
      });
    }, Oden.errors.InvalidData);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectTLSBadKey(): Promise<void> {
    await assertRejects(async () => {
      await Oden.connectTls({
        hostname: "deno.land",
        port: 443,
        cert: Oden.readTextFileSync(
          "tests/testdata/tls/localhost.crt",
        ),
        key: "bad data",
      });
    }, Oden.errors.InvalidData);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectTLSNotKey(): Promise<void> {
    await assertRejects(async () => {
      await Oden.connectTls({
        hostname: "deno.land",
        port: 443,
        cert: Oden.readTextFileSync(
          "tests/testdata/tls/localhost.crt",
        ),
        key: "",
      });
    }, Oden.errors.InvalidData);
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectWithCert() {
    // The test_server running on port 4552 responds with 'PASS' if client
    // authentication was successful. Try it by running test_server and
    //   curl --key cli/tests/testdata/tls/localhost.key \
    //        --cert cli/tests/testdata/tls/localhost.crt \
    //        --cacert cli/tests/testdata/tls/RootCA.crt https://localhost:4552/
    const conn = await Oden.connectTls({
      hostname: "localhost",
      port: 4552,
      cert: Oden.readTextFileSync(
        "tests/testdata/tls/localhost.crt",
      ),
      key: Oden.readTextFileSync(
        "tests/testdata/tls/localhost.key",
      ),
      caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
    });
    const result = decoder.decode(await readAll(conn));
    assertEquals(result, "PASS");
    conn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function connectTLSCaCerts() {
    const conn = await Oden.connectTls({
      hostname: "localhost",
      port: 4557,
      caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
    });
    const result = decoder.decode(await readAll(conn));
    assertEquals(result, "PASS");
    conn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function startTLSCaCerts() {
    const plainConn = await Oden.connect({
      hostname: "localhost",
      port: 4557,
    });
    const conn = await Oden.startTls(plainConn, {
      hostname: "localhost",
      caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
    });
    const result = decoder.decode(await readAll(conn));
    assertEquals(result, "PASS");
    conn.close();
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeSuccess() {
    const { listener, hostname, port } = listenTls();

    const acceptPromise = listener.accept();
    const connectPromise = Oden.connectTls({
      hostname,
      port,
      caCerts: [await Oden.readTextFile("tests/testdata/tls/RootCA.crt")],
    });
    const [conn1, conn2] = await Promise.all([acceptPromise, connectPromise]);
    listener.close();

    await Promise.all([conn1.handshake(), conn2.handshake()]);

    // Begin sending a 10mb blob over the TLS connection.
    const whole = new Uint8Array(10 << 20); // 10mb.
    whole.fill(42);
    const sendPromise = writeAll(conn1, whole);
    // Set up the other end to receive half of the large blob.
    const half = new Uint8Array(whole.byteLength / 2);
    const receivePromise = readFull(conn2, half);

    await conn1.handshake();
    await conn2.handshake();

    // Finish receiving the first 5mb.
    assertEquals(await receivePromise, half.length);

    // See that we can call `handshake()` in the middle of large reads and writes.
    await conn1.handshake();
    await conn2.handshake();

    // Receive second half of large blob. Wait for the send promise and check it.
    assertEquals(await readFull(conn2, half), half.length);
    await sendPromise;

    await conn1.handshake();
    await conn2.handshake();

    await conn1.closeWrite();
    await conn2.closeWrite();

    await conn1.handshake();
    await conn2.handshake();

    conn1.close();
    conn2.close();

    async function readFull(conn: Oden.Conn, buf: Uint8Array) {
      let offset, n;
      for (offset = 0; offset < buf.length; offset += n) {
        n = await conn.read(buf.subarray(offset, buf.length));
        assert(n != null && n > 0);
      }
      return offset;
    }
  },
);

Oden.test(
  { permissions: { read: true, net: true } },
  async function tlsHandshakeFailure() {
    let tls: { listener: Oden.TlsListener; port: number; hostname: string };

    async function server() {
      for await (const conn of tls.listener) {
        for (let i = 0; i < 10; i++) {
          // Handshake fails because the client rejects the server certificate.
          await assertRejects(
            () => conn.handshake(),
            Oden.errors.InvalidData,
            "received fatal alert",
          );
        }
        conn.close();
        break;
      }
    }

    async function connectTlsClient() {
      const conn = await Oden.connectTls({
        hostname: tls.hostname,
        port: tls.port,
      });
      // Handshake fails because the server presents a self-signed certificate.
      await assertRejects(
        () => conn.handshake(),
        Oden.errors.InvalidData,
        "invalid peer certificate: UnknownIssuer",
      );
      conn.close();
    }

    tls = listenTls();
    await Promise.all([server(), connectTlsClient()]);

    async function startTlsClient() {
      const tcpConn = await Oden.connect({
        hostname: tls.hostname,
        port: tls.port,
      });
      const tlsConn = await Oden.startTls(tcpConn, {
        hostname: "foo.land",
        caCerts: [Oden.readTextFileSync("tests/testdata/tls/RootCA.pem")],
      });
      // Handshake fails because hostname doesn't match the certificate.
      await assertRejects(
        () => tlsConn.handshake(),
        Oden.errors.InvalidData,
        "certificate not valid for name",
      );
      tlsConn.close();
    }

    tls = listenTls();
    await Promise.all([server(), startTlsClient()]);
  },
);

Oden.test(
  { permissions: { net: true } },
  async function listenTlsWithReuseAddr() {
    const deferred1 = Promise.withResolvers<void>();
    const { listener: listener1, port, hostname } = listenTls();

    listener1.accept().then((conn) => {
      conn.close();
      deferred1.resolve();
    });

    const conn1 = await Oden.connectTls({ hostname, port, caCerts });
    conn1.close();
    await deferred1.promise;
    listener1.close();

    const deferred2 = Promise.withResolvers<void>();
    const listener2 = Oden.listenTls({ hostname, port, cert, key });

    listener2.accept().then((conn) => {
      conn.close();
      deferred2.resolve();
    });

    const conn2 = await Oden.connectTls({ hostname, port, caCerts });
    conn2.close();
    await deferred2.promise;
    listener2.close();
  },
);

Oden.test({
  ignore: Oden.build.os !== "linux",
  permissions: { net: true },
}, async function listenTlsReusePort() {
  const { listener: listener1, port, hostname } = listenTls({
    reusePort: true,
  });
  const listener2 = Oden.listenTls({
    hostname,
    port,
    cert,
    key,
    reusePort: true,
  });
  let p1;
  let p2;
  let listener1Recv = false;
  let listener2Recv = false;
  while (!listener1Recv || !listener2Recv) {
    if (!p1) {
      p1 = listener1.accept().then((conn) => {
        conn.close();
        listener1Recv = true;
        p1 = undefined;
        listener1.close();
      }).catch(() => {});
    }
    if (!p2) {
      p2 = listener2.accept().then((conn) => {
        conn.close();
        listener2Recv = true;
        p2 = undefined;
        listener2.close();
      }).catch(() => {});
    }
    const conn = await Oden.connectTls({ hostname, port, caCerts });
    conn.close();
    await Promise.race([p1, p2]);
  }
});

Oden.test({
  ignore: Oden.build.os === "linux",
  permissions: { net: true },
}, function listenTlsReusePortDoesNothing() {
  const { listener: listener1, hostname, port } = listenTls({
    reusePort: true,
  });
  assertThrows(() => {
    Oden.listenTls({ hostname, port, cert, key, reusePort: true });
  }, Oden.errors.AddrInUse);
  listener1.close();
});

Oden.test({
  permissions: { net: true },
}, function listenTlsDoesNotThrowOnStringPort() {
  const listener = Oden.listenTls({
    hostname: "localhost",
    // @ts-ignore String port is not allowed by typing, but it shouldn't throw
    // for backwards compatibility.
    port: "0",
    cert,
    key,
  });
  listener.close();
});

Oden.test(
  { permissions: { net: true, read: true } },
  function listenTLSInvalidCert() {
    assertThrows(() => {
      Oden.listenTls({
        hostname: "localhost",
        port: 0,
        cert: Oden.readTextFileSync("tests/testdata/tls/invalid.crt"),
        key: Oden.readTextFileSync("tests/testdata/tls/localhost.key"),
      });
    }, Oden.errors.InvalidData);
  },
);

Oden.test(
  { permissions: { net: true, read: true } },
  function listenTLSInvalidKey() {
    assertThrows(() => {
      Oden.listenTls({
        hostname: "localhost",
        port: 0,
        cert: Oden.readTextFileSync("tests/testdata/tls/localhost.crt"),
        key: Oden.readTextFileSync("tests/testdata/tls/invalid.key"),
      });
    }, Oden.errors.InvalidData);
  },
);

Oden.test(
  { permissions: { net: true, read: true } },
  function listenTLSEcKey() {
    const listener = Oden.listenTls({
      hostname: "localhost",
      port: 0,
      cert: Oden.readTextFileSync("tests/testdata/tls/localhost_ecc.crt"),
      key: Oden.readTextFileSync("tests/testdata/tls/localhost_ecc.key"),
    });
    listener.close();
  },
);
