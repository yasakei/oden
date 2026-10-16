// Copyright 2018-2026 the Oden authors. MIT license.

import { assert, assertEquals, assertThrows, delay } from "./test_util.ts";

// TODO(ry) Add more tests to specify format.

Oden.test({ permissions: { read: false } }, function watchFsPermissions() {
  assertThrows(() => {
    Oden.watchFs(".");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function watchFsInvalidPath() {
  if (Oden.build.os === "windows") {
    assertThrows(
      () => {
        Oden.watchFs("non-existent.file");
      },
      Error,
      "Input watch path is neither a file nor a directory",
    );
  } else {
    assertThrows(() => {
      Oden.watchFs("non-existent.file");
    }, Oden.errors.NotFound);
  }
});

async function getTwoEvents(
  iter: Oden.FsWatcher,
): Promise<Oden.FsEvent[]> {
  const events = [];
  for await (const event of iter) {
    events.push(event);
    if (events.length > 2) break;
  }
  return events;
}

async function makeTempDir(): Promise<string> {
  const testDir = await Oden.makeTempDir();
  // The watcher sometimes witnesses the creation of it's own root
  // directory. Delay a bit.
  await delay(100);
  return testDir;
}

async function makeTempFile(): Promise<string> {
  const testFile = await Oden.makeTempFile();
  // The watcher sometimes witnesses the creation of it's own root
  // directory. Delay a bit.
  await delay(100);
  return testFile;
}

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsBasic() {
    const testDir = await makeTempDir();
    const iter = Oden.watchFs(testDir);

    // Asynchronously capture two fs events.
    const eventsPromise = getTwoEvents(iter);

    // Make some random file system activity.
    const file1 = testDir + "/file1.txt";
    const file2 = testDir + "/file2.txt";
    Oden.writeFileSync(file1, new Uint8Array([0, 1, 2]));
    Oden.writeFileSync(file2, new Uint8Array([0, 1, 2]));

    // We should have gotten two fs events.
    const events = await eventsPromise;
    assert(events.length >= 2);
    assert(events[0].kind == "create");
    assert(events[0].paths[0].includes(testDir));
    assert(events[1].kind == "create" || events[1].kind == "modify");
    assert(events[1].paths[0].includes(testDir));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsRename() {
    const testDir = await makeTempDir();
    const watcher = Oden.watchFs(testDir);
    async function waitForRename() {
      for await (const event of watcher) {
        if (event.kind === "rename") {
          break;
        }
      }
    }
    const eventPromise = waitForRename();
    const file = testDir + "/file.txt";
    await Oden.writeTextFile(file, "hello");
    await Oden.rename(file, testDir + "/file2.txt");
    await eventPromise;
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsReturn() {
    const testDir = await makeTempDir();
    const iter = Oden.watchFs(testDir);

    // Asynchronously loop events.
    const eventsPromise = getTwoEvents(iter);

    // Close the watcher.
    await iter.return!();

    // Expect zero events.
    const events = await eventsPromise;
    assertEquals(events, []);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsClose() {
    const testDir = await makeTempDir();
    const iter = Oden.watchFs(testDir);

    // Asynchronously loop events.
    const eventsPromise = getTwoEvents(iter);

    // Close the watcher.
    iter.close();

    // Expect zero events.
    const events = await eventsPromise;
    assertEquals(events, []);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsCloseIsIdempotent() {
    const testDir = await makeTempDir();
    const watcher = Oden.watchFs(testDir);
    const iterator = watcher[Symbol.asyncIterator]();

    watcher.close();
    watcher.close();

    assertEquals(await iterator.next(), { value: undefined, done: true });
    assertEquals(await iterator.return!(), { value: undefined, done: true });
    assertEquals(await iterator.next(), { value: undefined, done: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsExplicitResourceManagement() {
    let res;
    {
      const testDir = await makeTempDir();
      using iter = Oden.watchFs(testDir);

      res = iter[Symbol.asyncIterator]().next();
    }

    const { done } = await res;
    assert(done);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsExplicitResourceManagementManualClose() {
    const testDir = await makeTempDir();
    using iter = Oden.watchFs(testDir);

    const res = iter[Symbol.asyncIterator]().next();

    iter.close();
    const { done } = await res;
    assert(done);
  },
);

// Regression test for https://github.com/denoland/deno/issues/27558
// Removing a file outside the watched directory should not produce events.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsNoSpuriousEventsFromSiblingDir() {
    const parentDir = await makeTempDir();
    const watchedDir = parentDir + "/watched";
    const otherDir = parentDir + "/other";
    Oden.mkdirSync(watchedDir);
    Oden.mkdirSync(otherDir);
    await delay(100);

    using watcher = Oden.watchFs(watchedDir);

    // Create and immediately remove a file in the sibling directory.
    // Before the fix, this would send a spurious "remove" event to
    // watchers on watchedDir because the is_file_removed fallback had
    // no path filtering.
    const otherFile = otherDir + "/temp.txt";
    Oden.writeFileSync(otherFile, new Uint8Array([1, 2, 3]));
    Oden.removeSync(otherFile);

    // Now create a real file in the watched directory so we have
    // something to observe.
    await delay(100);
    const realFile = watchedDir + "/real.txt";
    Oden.writeFileSync(realFile, new Uint8Array([1, 2, 3]));

    // Collect events -- the first meaningful event should be for real.txt,
    // not a spurious remove for temp.txt.
    for await (const event of watcher) {
      // We should never see events for files in otherDir
      for (const path of event.paths) {
        assert(
          !path.includes("other"),
          `Received spurious event for file outside watched dir: ${path}`,
        );
      }
      // Once we see the expected create, we're done
      if (event.kind === "create" || event.kind === "modify") {
        assert(event.paths[0].includes("real.txt"));
        break;
      }
    }
  },
);

// Regression test for https://github.com/denoland/deno/issues/32000
// Watching a relative path like "./" must produce event paths free of
// embedded "./" segments. Previously notify joined "./" with the relative
// portion of each event, so callers got `<cwd>/./sub/file` instead of
// `<cwd>/sub/file`.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsRelativePathNoCurDirSegment() {
    const testDir = await makeTempDir();
    const subDir = testDir + "/sub";
    Oden.mkdirSync(subDir);
    await delay(100);

    const originalCwd = Oden.cwd();
    Oden.chdir(testDir);
    try {
      using watcher = Oden.watchFs("./");

      const target = subDir + "/file.txt";
      const writePromise = (async () => {
        await delay(50);
        Oden.writeFileSync(target, new Uint8Array([1, 2, 3]));
      })();

      for await (const event of watcher) {
        for (const path of event.paths) {
          const sep = Oden.build.os === "windows" ? "\\" : "/";
          assert(
            !path.includes(`${sep}.${sep}`),
            `event path should not contain "${sep}.${sep}": ${path}`,
          );
          assert(
            !path.endsWith(`${sep}.`),
            `event path should not end with "${sep}.": ${path}`,
          );
        }
        if (event.paths.some((p) => p.endsWith("file.txt"))) {
          break;
        }
      }
      await writePromise;
    } finally {
      Oden.chdir(originalCwd);
    }
  },
);

// Regression test for https://github.com/denoland/deno/issues/27742
// Closing a `Oden.FsWatcher` and creating a new one for the same path must
// not produce duplicate events on the new watcher. Before the fix, the
// shared `RecommendedWatcher` never had paths unwatched on close, so on
// Windows each closed-then-recreated watcher left behind another
// `ReadDirectoryChangesW` registration, causing N-fold duplicate events.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsCloseAndRecreateNoDuplicates() {
    const testDir = await makeTempDir();

    async function openClose() {
      const w = Oden.watchFs(testDir);
      const closer = setTimeout(() => w.close(), 100);
      for await (const _ of w) {
        // drain
      }
      clearTimeout(closer);
    }

    // Open and close three watchers in sequence.
    await openClose();
    await openClose();
    await openClose();

    // Now open a fourth watcher and trigger a single fs event. We must
    // only see events for that single change reach us once per real event.
    using watcher = Oden.watchFs(testDir);

    const target = testDir + "/probe.txt";
    const writePromise = (async () => {
      // Give the watcher a moment to settle before producing the event.
      await delay(100);
      Oden.writeFileSync(target, new Uint8Array([1, 2, 3]));
    })();

    // Collect events for a brief window after the write. Any event we
    // observe must match a real change to probe.txt; we then count how
    // many times each (kind, path) tuple appears. Filesystems legitimately
    // emit at most a couple of events for a single write (`create` plus
    // an optional `modify`), so seeing the same tuple 3+ times means the
    // bug is still present.
    const seen = new Map<string, number>();
    const collectPromise = (async () => {
      const start = Date.now();
      for await (const event of watcher) {
        if (event.paths.some((p) => p.endsWith("probe.txt"))) {
          const key = `${event.kind}:${event.paths.join(",")}`;
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
        if (Date.now() - start > 500) break;
      }
    })();

    await writePromise;
    // Wait long enough to receive any duplicates the buggy implementation
    // would emit.
    await delay(600);
    watcher.close();
    await collectPromise;

    for (const [key, count] of seen) {
      assert(
        count <= 2,
        `event "${key}" was emitted ${count} times; expected at most 2 ` +
          `(create + optional modify). This indicates a leaked watch from ` +
          `a previously-closed Oden.FsWatcher.`,
      );
    }
  },
);

// Regression test for https://github.com/denoland/deno/issues/11373
// A burst of concurrent file writes must not be silently lost: every file
// written below must show up in at least one event, unless the loss is
// explicitly reported via a `rescan`-flagged event.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsBurstDeliversAllEvents() {
    const testDir = await makeTempDir();
    using watcher = Oden.watchFs(testDir);

    const fileCount = 100;
    // Match events by file name: on macOS the events report canonicalized
    // paths (/private/var/...) while makeTempDir returns /var/... paths.
    const remaining = new Set<string>();
    for (let i = 0; i < fileCount; i++) {
      remaining.add(`file${i}.txt`);
    }

    // Escape hatch so the iteration below can't hang the test forever if
    // events do get lost.
    const deadline = setTimeout(() => watcher.close(), 20_000);
    let sawRescan = false;
    const collectPromise = (async () => {
      for await (const event of watcher) {
        if (event.flag === "rescan") {
          sawRescan = true;
          break;
        }
        for (const path of event.paths) {
          const name = path.replaceAll("\\", "/").split("/").pop()!;
          remaining.delete(name);
        }
        if (remaining.size === 0) break;
      }
    })();

    await Promise.all(
      [...remaining].map((name) =>
        Oden.writeTextFile(`${testDir}/${name}`, "content")
      ),
    );

    await collectPromise;
    clearTimeout(deadline);
    assert(
      remaining.size === 0 || sawRescan,
      `events for ${remaining.size}/${fileCount} files were silently lost`,
    );
  },
);

// Regression test for https://github.com/denoland/deno/issues/11373
// When events arrive faster than the consumer drains them and the internal
// queue overflows, the loss must be reported with a `rescan`-flagged event
// instead of being silent.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsQueueOverflowEmitsRescan() {
    const testDir = await makeTempDir();
    using watcher = Oden.watchFs(testDir);

    // Produce more events than the internal queue can hold (1024 entries,
    // see FS_EVENT_QUEUE_CAPACITY in runtime/ops/fs_events.rs) while the
    // consumer is not yet polling.
    for (let i = 0; i < 1500; i++) {
      Oden.writeFileSync(`${testDir}/file${i}.txt`, new Uint8Array([1]));
    }
    // Give the watcher backend time to process (and overflow on) the burst
    // before we start consuming.
    await delay(3000);

    // Escape hatch so the iteration below can't hang the test forever if
    // the rescan event never arrives.
    const deadline = setTimeout(() => watcher.close(), 20_000);
    // Don't require the rescan to be the *first* event: on a slow runner the
    // backend may not have overflowed the queue yet when polling starts, in
    // which case some regular events are delivered before the overflow
    // happens and is reported.
    let sawRescan = false;
    for await (const event of watcher) {
      if (event.flag === "rescan") {
        sawRescan = true;
        break;
      }
    }
    clearTimeout(deadline);
    assert(sawRescan, "expected a rescan event after the queue overflowed");
  },
);

// On macOS, FSEvents does not reliably emit remove events for individually
// watched files. The previous implementation masked this by forwarding
// unrelated events for any non-existent file to all watchers (the bug
// behind #27558). Skip on macOS until the notify crate or our watcher
// can detect removals of individually watched files on this platform.
Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "darwin",
  },
  async function watchFsRemove() {
    const testFile = await makeTempFile();
    using watcher = Oden.watchFs(testFile);
    async function waitForRemove() {
      for await (const event of watcher) {
        if (event.kind === "remove") {
          return event;
        }
      }
    }
    const eventPromise = waitForRemove();

    await Oden.remove(testFile);

    // Expect zero events.
    const event = await eventPromise;
    assertEquals(event!.kind, "remove");
  },
);

// The `ignore` option must filter out events whose paths fall under an
// ignored directory, while still delivering events for everything else.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsIgnore() {
    const testDir = await makeTempDir();
    const ignoredDir = testDir + "/ignored";
    const nestedDir = testDir + "/nested";
    Oden.mkdirSync(ignoredDir);
    Oden.mkdirSync(nestedDir);
    await delay(100);

    using watcher = Oden.watchFs(testDir, { ignore: [ignoredDir] });

    // Activity inside the ignored directory must never surface.
    Oden.writeFileSync(ignoredDir + "/skip.txt", new Uint8Array([1, 2, 3]));

    // A file in a non-ignored subdirectory is created afterwards and is what
    // we expect to observe. Using a nested directory also confirms that the
    // default recursive watch still applies when `ignore` is passed.
    await delay(100);
    const realFile = nestedDir + "/real.txt";
    Oden.writeFileSync(realFile, new Uint8Array([1, 2, 3]));

    for await (const event of watcher) {
      for (const path of event.paths) {
        assert(
          !path.includes("ignored"),
          `Received event for an ignored path: ${path}`,
        );
      }
      if (event.kind === "create" || event.kind === "modify") {
        assert(event.paths[0].includes("real.txt"));
        break;
      }
    }
  },
);

// Deletions inside an ignored directory must be suppressed (the removed-path
// matching also has to consult the ignore set), while a deletion outside the
// ignored directory still surfaces.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsIgnoreRemove() {
    const testDir = await makeTempDir();
    const ignoredDir = testDir + "/ignored";
    Oden.mkdirSync(ignoredDir);

    // Both files exist before watching starts so the only events come from
    // the removals below.
    const ignoredFile = ignoredDir + "/skip.txt";
    const realFile = testDir + "/real.txt";
    Oden.writeFileSync(ignoredFile, new Uint8Array([1, 2, 3]));
    Oden.writeFileSync(realFile, new Uint8Array([1, 2, 3]));
    await delay(100);

    using watcher = Oden.watchFs(testDir, { ignore: [ignoredDir] });

    // A removal inside the ignored directory must never surface.
    await Oden.remove(ignoredFile);

    // A removal outside the ignored directory is what we expect to observe.
    await delay(100);
    await Oden.remove(realFile);

    for await (const event of watcher) {
      for (const path of event.paths) {
        assert(
          !path.includes("ignored"),
          `Received event for an ignored path: ${path}`,
        );
      }
      if (event.kind === "remove") {
        assert(event.paths[0].includes("real.txt"));
        break;
      }
    }
  },
);

// A single string (not an array) is accepted for `ignore`.
Oden.test(
  { permissions: { read: true, write: true } },
  async function watchFsIgnoreSingleString() {
    const testDir = await makeTempDir();
    const ignoredDir = testDir + "/ignored";
    Oden.mkdirSync(ignoredDir);
    await delay(100);

    using watcher = Oden.watchFs(testDir, { ignore: ignoredDir });

    Oden.writeFileSync(ignoredDir + "/skip.txt", new Uint8Array([1, 2, 3]));

    await delay(100);
    const realFile = testDir + "/real.txt";
    Oden.writeFileSync(realFile, new Uint8Array([1, 2, 3]));

    for await (const event of watcher) {
      for (const path of event.paths) {
        assert(
          !path.includes("ignored"),
          `Received event for an ignored path: ${path}`,
        );
      }
      if (event.kind === "create" || event.kind === "modify") {
        assert(event.paths[0].includes("real.txt"));
        break;
      }
    }
  },
);
