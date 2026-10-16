// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertFalse } from "./test_util.ts";

Oden.test({}, async function queueTestDbClose() {
  const db: Oden.Kv = await Oden.openKv(":memory:");
  db.close();
  try {
    await db.listenQueue(() => {});
    assertFalse(false);
  } catch (e) {
    assertEquals((e as Error).message, "Queue already closed");
  }
});
