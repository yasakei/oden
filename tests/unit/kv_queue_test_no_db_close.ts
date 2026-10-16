// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertEquals, assertNotEquals } from "./test_util.ts";

Oden.test({
  sanitizeOps: false,
  sanitizeResources: false,
}, async function queueTestNoDbClose() {
  const db: Oden.Kv = await Oden.openKv(":memory:");
  const { promise, resolve } = Promise.withResolvers<void>();
  let dequeuedMessage: unknown = null;
  db.listenQueue((msg) => {
    dequeuedMessage = msg;
    resolve();
  });
  const res = await db.enqueue("test");
  assert(res.ok);
  assertNotEquals(res.versionstamp, null);
  await promise;
  assertEquals(dequeuedMessage, "test");
});
