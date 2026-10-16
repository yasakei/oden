// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Oden.test({ permissions: { write: true } }, function makeTempDirSyncSuccess() {
  const dir1 = Oden.makeTempDirSync({ prefix: "hello", suffix: "world" });
  const dir2 = Oden.makeTempDirSync({ prefix: "hello", suffix: "world" });
  // Check that both dirs are different.
  assert(dir1 !== dir2);
  for (const dir of [dir1, dir2]) {
    // Check that the prefix and suffix are applied.
    const lastPart = dir.replace(/^.*[\\\/]/, "");
    assert(lastPart.startsWith("hello"));
    assert(lastPart.endsWith("world"));
  }
  // Check that the `dir` option works.
  const dir3 = Oden.makeTempDirSync({ dir: dir1 });
  assert(dir3.startsWith(dir1));
  assert(/^[\\\/]/.test(dir3.slice(dir1.length)));
  // Check that creating a temp dir inside a nonexisting directory fails.
  assertThrows(() => {
    Oden.makeTempDirSync({ dir: "/baddir" });
  }, Oden.errors.NotFound);
});

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function makeTempDirSyncMode() {
    const path = Oden.makeTempDirSync();
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o700 & ~Oden.umask());
    }
  },
);

Oden.test({ permissions: { write: false } }, function makeTempDirSyncPerm() {
  // makeTempDirSync should require write permissions (for now).
  assertThrows(() => {
    Oden.makeTempDirSync({ dir: "/baddir" });
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { write: true } },
  async function makeTempDirSuccess() {
    const dir1 = await Oden.makeTempDir({ prefix: "hello", suffix: "world" });
    const dir2 = await Oden.makeTempDir({ prefix: "hello", suffix: "world" });
    // Check that both dirs are different.
    assert(dir1 !== dir2);
    for (const dir of [dir1, dir2]) {
      // Check that the prefix and suffix are applied.
      const lastPart = dir.replace(/^.*[\\\/]/, "");
      assert(lastPart.startsWith("hello"));
      assert(lastPart.endsWith("world"));
    }
    // Check that the `dir` option works.
    const dir3 = await Oden.makeTempDir({ dir: dir1 });
    assert(dir3.startsWith(dir1));
    assert(/^[\\\/]/.test(dir3.slice(dir1.length)));
    // Check that creating a temp dir inside a nonexisting directory fails.
    await assertRejects(async () => {
      await Oden.makeTempDir({ dir: "/baddir" });
    }, Oden.errors.NotFound);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function makeTempDirMode() {
    const path = await Oden.makeTempDir();
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o700 & ~Oden.umask());
    }
  },
);

Oden.test({ permissions: { write: true } }, function makeTempFileSyncSuccess() {
  const file1 = Oden.makeTempFileSync({ prefix: "hello", suffix: "world" });
  const file2 = Oden.makeTempFileSync({ prefix: "hello", suffix: "world" });
  // Check that both dirs are different.
  assert(file1 !== file2);
  for (const dir of [file1, file2]) {
    // Check that the prefix and suffix are applied.
    const lastPart = dir.replace(/^.*[\\\/]/, "");
    assert(lastPart.startsWith("hello"));
    assert(lastPart.endsWith("world"));
  }
  // Check that the `dir` option works.
  const dir = Oden.makeTempDirSync({ prefix: "tempdir" });
  const file3 = Oden.makeTempFileSync({ dir });
  assert(file3.startsWith(dir));
  assert(/^[\\\/]/.test(file3.slice(dir.length)));
  // Check that creating a temp file inside a nonexisting directory fails.
  assertThrows(() => {
    Oden.makeTempFileSync({ dir: "/baddir" });
  }, Oden.errors.NotFound);
});

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function makeTempFileSyncMode() {
    const path = Oden.makeTempFileSync();
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o600 & ~Oden.umask());
    }
  },
);

Oden.test({ permissions: { write: false } }, function makeTempFileSyncPerm() {
  // makeTempFileSync should require write permissions (for now).
  assertThrows(() => {
    Oden.makeTempFileSync({ dir: "/baddir" });
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { write: true } },
  async function makeTempFileSuccess() {
    const file1 = await Oden.makeTempFile({ prefix: "hello", suffix: "world" });
    const file2 = await Oden.makeTempFile({ prefix: "hello", suffix: "world" });
    // Check that both dirs are different.
    assert(file1 !== file2);
    for (const dir of [file1, file2]) {
      // Check that the prefix and suffix are applied.
      const lastPart = dir.replace(/^.*[\\\/]/, "");
      assert(lastPart.startsWith("hello"));
      assert(lastPart.endsWith("world"));
    }
    // Check that the `dir` option works.
    const dir = Oden.makeTempDirSync({ prefix: "tempdir" });
    const file3 = await Oden.makeTempFile({ dir });
    assert(file3.startsWith(dir));
    assert(/^[\\\/]/.test(file3.slice(dir.length)));
    // Check that creating a temp file inside a nonexisting directory fails.
    await assertRejects(async () => {
      await Oden.makeTempFile({ dir: "/baddir" });
    }, Oden.errors.NotFound);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function makeTempFileMode() {
    const path = await Oden.makeTempFile();
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o600 & ~Oden.umask());
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function makeTempInvalidCharacter() {
    // Various control and ASCII characters that are disallowed on all platforms
    for (const invalid of ["\0", "*", "\x9f"]) {
      assertThrows(() => Oden.makeTempFileSync({ prefix: invalid }));
      assertThrows(() => Oden.makeTempDirSync({ prefix: invalid }));
      assertThrows(() => Oden.makeTempFileSync({ suffix: invalid }));
      assertThrows(() => Oden.makeTempDirSync({ suffix: invalid }));
    }

    // On Windows, files can't end with space or period
    if (Oden.build.os === "windows") {
      assertThrows(() => Oden.makeTempFileSync({ suffix: "." }));
      assertThrows(() => Oden.makeTempFileSync({ suffix: " " }));
    } else {
      Oden.makeTempFileSync({ suffix: "." });
      Oden.makeTempFileSync({ suffix: " " });
    }
  },
);
