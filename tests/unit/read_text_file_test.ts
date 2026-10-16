// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
  unreachable,
} from "./test_util.ts";

Oden.test({ permissions: { read: true } }, function readTextFileSyncSuccess() {
  const data = Oden.readTextFileSync("tests/testdata/assets/fixture.json");
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: true } }, function readTextFileSyncByUrl() {
  const data = Oden.readTextFileSync(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: false } }, function readTextFileSyncPerm() {
  assertThrows(() => {
    Oden.readTextFileSync("tests/testdata/assets/fixture.json");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readTextFileSyncNotFound() {
  assertThrows(() => {
    Oden.readTextFileSync("bad_filename");
  }, Oden.errors.NotFound);
});

// Reading a broken (dangling) symlink should report NotFound, not
// FilesystemLoop ("Too many levels of symbolic links"). The canonicalized
// path is opened with O_NOFOLLOW, which reports a surviving symlink tail as
// ELOOP; that is translated to ENOENT. Regression test for
// https://github.com/denoland/deno/issues/29139
Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  function readTextFileSyncBrokenSymlink() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir + "/target.txt";
    const link = testDir + "/link.txt";
    Oden.writeTextFileSync(target, "hello");
    Oden.symlinkSync(target, link);
    // The link resolves while the target exists.
    assertEquals(Oden.readTextFileSync(link), "hello");
    // Once the target is gone the link is broken.
    Oden.removeSync(target);
    assertThrows(() => Oden.readTextFileSync(link), Oden.errors.NotFound);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readTextFileSuccess() {
    const data = await Oden.readTextFile(
      "tests/testdata/assets/fixture.json",
    );
    assert(data.length > 0);
    const pkg = JSON.parse(data);
    assertEquals(pkg.name, "oden");
  },
);

Oden.test({ permissions: { read: true } }, async function readTextFileByUrl() {
  const data = await Oden.readTextFile(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: false } }, async function readTextFilePerm() {
  await assertRejects(async () => {
    await Oden.readTextFile("tests/testdata/assets/fixture.json");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readTextFileSyncLoop() {
  for (let i = 0; i < 256; i++) {
    Oden.readTextFileSync("tests/testdata/assets/fixture.json");
  }
});

Oden.test(
  { permissions: { read: true } },
  async function readTextFileDoesNotLeakResources() {
    await assertRejects(async () => await Oden.readTextFile("cli"));
  },
);

Oden.test(
  { permissions: { read: true } },
  function readTextFileSyncDoesNotLeakResources() {
    assertThrows(() => Oden.readTextFileSync("cli"));
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignal() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort());
    const error = await assertRejects(
      async () => {
        await Oden.readTextFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assert(error instanceof DOMException);
    assertEquals(error.name, "AbortError");
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalReason() {
    const ac = new AbortController();
    const abortReason = new Error();
    queueMicrotask(() => ac.abort(abortReason));
    const error = await assertRejects(
      async () => {
        await Oden.readTextFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assertEquals(error, abortReason);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalPrimitiveReason() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort("Some string"));
    try {
      await Oden.readTextFile("tests/testdata/assets/fixture.json", {
        signal: ac.signal,
      });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
  },
);

// Test that AbortController's cancel handle is cleaned-up correctly, and do not leak resources.
Oden.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalNotCalled() {
    const ac = new AbortController();
    await Oden.readTextFile("tests/testdata/assets/fixture.json", {
      signal: ac.signal,
    });
  },
);

Oden.test(
  { ignore: Oden.build.os !== "linux" },
  async function readTextFileProcFs() {
    const data = await Oden.readTextFile("/proc/self/stat");
    assert(data.length > 0);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function readTextFileSyncV8LimitError() {
    const kStringMaxLengthPlusOne = 536870888 + 1;
    const bytes = new Uint8Array(kStringMaxLengthPlusOne);
    const filePath = "tests/testdata/too_big_a_file.txt";

    try {
      Oden.writeFileSync(filePath, bytes);
    } catch {
      // NOTE(bartlomieju): writing a 0.5Gb file might be too much for CI,
      // so skip running if writing fails.
      return;
    }

    assertThrows(
      () => {
        Oden.readTextFileSync(filePath);
      },
      TypeError,
      "buffer exceeds maximum length",
    );

    Oden.removeSync(filePath);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function readTextFileV8LimitError() {
    const kStringMaxLengthPlusOne = 536870888 + 1;
    const bytes = new Uint8Array(kStringMaxLengthPlusOne);
    const filePath = "tests/testdata/too_big_a_file_2.txt";

    try {
      await Oden.writeFile(filePath, bytes);
    } catch {
      // NOTE(bartlomieju): writing a 0.5Gb file might be too much for CI,
      // so skip running if writing fails.
      return;
    }

    await assertRejects(
      async () => {
        await Oden.readTextFile(filePath);
      },
      TypeError,
      "buffer exceeds maximum length",
    );

    await Oden.remove(filePath);
  },
);
