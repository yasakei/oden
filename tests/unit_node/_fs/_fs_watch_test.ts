// Copyright 2018-2026 the Oden authors. MIT license.
import {
  type BigIntStats,
  type Stats,
  unwatchFile,
  watch,
  watchFile,
} from "node:fs";
import { watch as watchPromise } from "node:fs/promises";
import { assert, assertEquals, assertRejects } from "@std/assert";
import { spy } from "@std/testing/mock";

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

Oden.test({
  name: "watching a file",
  async fn() {
    const file = Oden.makeTempFileSync();
    const result: Array<[string, string | null]> = [];
    const watcher = watch(
      file,
      (eventType, filename) => result.push([eventType, filename]),
    );
    await wait(100);
    Oden.writeTextFileSync(file, "something");
    await wait(100);
    watcher.close();
    await wait(100);
    assertEquals(result.length >= 1, true);
  },
});

Oden.test({
  name: "watching a file with options",
  // TODO(bartlomieju): this test is flaky on CI
  ignore: true,
  async fn() {
    const file = Oden.makeTempFileSync();
    const spyFn = spy();
    watchFile(
      file,
      { interval: 10 },
      spyFn,
    );
    await wait(100);
    assertEquals(spyFn.calls.length, 0);
    await Oden.writeTextFile(file, "something");
    await wait(100);
    assertEquals(spyFn.calls.length, 1);
    unwatchFile(file);
    await wait(100);
    assertEquals(spyFn.calls.length, 1);
  },
});

Oden.test({
  name: "watchFile detects metadata-only changes (chmod)",
  ignore: Oden.build.os === "windows",
  async fn() {
    const file = Oden.makeTempFileSync();
    Oden.writeTextFileSync(file, "foo");
    Oden.chmodSync(file, 0o644);

    const calls: Array<[Stats, Stats]> = [];
    watchFile(
      file,
      { interval: 10 },
      (curr, prev) => calls.push([curr as Stats, prev as Stats]),
    );

    try {
      await wait(50);
      assertEquals(calls.length, 0);
      Oden.chmodSync(file, 0o600);
      await wait(150);
      assertEquals(calls.length, 1);
      assert(calls[0][0].mode !== calls[0][1].mode);
    } finally {
      unwatchFile(file);
    }
  },
});

Oden.test({
  name: "watchFile honors bigint option",
  async fn() {
    const file = Oden.makeTempFileSync();
    Oden.writeTextFileSync(file, "foo");

    const calls: Array<[BigIntStats, BigIntStats]> = [];
    watchFile(
      file,
      { interval: 10, bigint: true },
      (curr, prev) => calls.push([curr as BigIntStats, prev as BigIntStats]),
    );

    try {
      await wait(50);
      Oden.writeTextFileSync(file, "bar");
      await wait(150);
      assert(calls.length >= 1);
      assertEquals(typeof calls[0][0].mtimeMs, "bigint");
      assertEquals(typeof calls[0][0].ino, "bigint");
    } finally {
      unwatchFile(file);
    }
  },
});

Oden.test({
  name: "watch.unref() should work",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const file = Oden.makeTempFileSync();
    const watcher = watch(file, () => {});
    // Wait for the watcher to be initialized
    await wait(10);
    // @ts-ignore node types are outdated in oden.
    watcher.unref();
  },
});

Oden.test({
  name: "node [fs/promises] watch should return async iterable",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const file = Oden.makeTempFileSync();
    Oden.writeTextFileSync(file, "foo");

    const result: { eventType: string; filename: string | null }[] = [];

    const controller = new AbortController();
    const watcher = watchPromise(file, {
      // Node types resolved by the LSP clash with ours
      // deno-lint-ignore no-explicit-any
      signal: controller.signal as any,
    });

    const deferred = Promise.withResolvers<void>();
    let stopLength = 0;
    setTimeout(async () => {
      Oden.writeTextFileSync(file, "something");
      controller.abort();
      stopLength = result.length;
      await wait(100);
      Oden.writeTextFileSync(file, "something else");
      await wait(100);
      deferred.resolve();
    }, 100);

    // Aborting the signal must surface as an AbortError thrown from the
    // async iterator, matching Node's `fs.promises.watch` behavior.
    await assertRejects(
      async () => {
        for await (const event of watcher) {
          result.push(event);
        }
      },
      Error,
      "The operation was aborted",
    );
    await deferred.promise;

    assertEquals(result.length, stopLength);
    assert(
      result.every((item) =>
        typeof item.eventType === "string" && typeof item.filename === "string"
      ),
    );
  },
});
