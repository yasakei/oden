// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  async function fsFileUtimeSyncSuccess() {
    const testDir = await Oden.makeTempDir();
    const filename = testDir + "/file.txt";
    using file = await Oden.open(filename, {
      create: true,
      write: true,
    });

    const atime = 1000;
    const mtime = 50000;
    await file.utime(atime, mtime);
    await file.syncData();

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function fsFileUtimeFailPermissions() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeTextFileSync(filename, "");
    Oden.permissions.revokeSync({ name: "write" });
    using file = await Oden.open(filename, {
      read: true,
      write: false,
    });

    const atime = 1000;
    const mtime = 50000;
    await assertRejects(
      () => file.utime(atime, mtime),
      Oden.errors.NotCapable,
      "Requires write access to",
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function futimeSyncSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    using file = Oden.openSync(filename, {
      create: true,
      write: true,
    });

    const atime = 1000;
    const mtime = 50000;
    file.utimeSync(atime, mtime);
    file.syncDataSync();

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function fsFileUtimeSyncFailPermissions() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeTextFileSync(filename, "");
    Oden.permissions.revokeSync({ name: "write" });
    using file = Oden.openSync(filename, {
      read: true,
      write: false,
    });

    const atime = 1000;
    const mtime = 50000;
    assertThrows(
      () => file.utimeSync(atime, mtime),
      Oden.errors.NotCapable,
      "Requires write access to",
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncFileSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });

    const atime = 1000;
    const mtime = 50000;
    Oden.utimeSync(filename, atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncUrlSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });

    const atime = 1000;
    const mtime = 50000;
    Oden.utimeSync(pathToAbsoluteFileUrl(filename), atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncDirectorySuccess() {
    const testDir = Oden.makeTempDirSync();

    const atime = 1000;
    const mtime = 50000;
    Oden.utimeSync(testDir, atime, mtime);

    const dirInfo = Oden.statSync(testDir);
    assertEquals(dirInfo.atime, new Date(atime * 1000));
    assertEquals(dirInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncDateSuccess() {
    const testDir = Oden.makeTempDirSync();

    const atime = new Date(1000_000);
    const mtime = new Date(50000_000);
    Oden.utimeSync(testDir, atime, mtime);

    const dirInfo = Oden.statSync(testDir);
    assertEquals(dirInfo.atime, atime);
    assertEquals(dirInfo.mtime, mtime);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncFileDateSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });
    const atime = new Date();
    const mtime = new Date();
    Oden.utimeSync(filename, atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, atime);
    assertEquals(fileInfo.mtime, mtime);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncLargeNumberSuccess() {
    const testDir = Oden.makeTempDirSync();

    // There are Rust side caps (might be fs relate),
    // so JUST make them slightly larger than UINT32_MAX.
    const atime = 0x100000001;
    const mtime = 0x100000002;
    Oden.utimeSync(testDir, atime, mtime);

    const dirInfo = Oden.statSync(testDir);
    assertEquals(dirInfo.atime, new Date(atime * 1000));
    assertEquals(dirInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function utimeSyncNotFound() {
    const atime = 1000;
    const mtime = 50000;

    assertThrows(
      () => {
        Oden.utimeSync("/baddir", atime, mtime);
      },
      Oden.errors.NotFound,
      "utime '/baddir'",
    );
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  function utimeSyncPerm() {
    const atime = 1000;
    const mtime = 50000;

    assertThrows(() => {
      Oden.utimeSync("/some_dir", atime, mtime);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeFileSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });

    const atime = 1000;
    const mtime = 50000;
    await Oden.utime(filename, atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeUrlSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });

    const atime = 1000;
    const mtime = 50000;
    await Oden.utime(pathToAbsoluteFileUrl(filename), atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, new Date(atime * 1000));
    assertEquals(fileInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeDirectorySuccess() {
    const testDir = Oden.makeTempDirSync();

    const atime = 1000;
    const mtime = 50000;
    await Oden.utime(testDir, atime, mtime);

    const dirInfo = Oden.statSync(testDir);
    assertEquals(dirInfo.atime, new Date(atime * 1000));
    assertEquals(dirInfo.mtime, new Date(mtime * 1000));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeDateSuccess() {
    const testDir = Oden.makeTempDirSync();

    const atime = new Date(100_000);
    const mtime = new Date(5000_000);
    await Oden.utime(testDir, atime, mtime);

    const dirInfo = Oden.statSync(testDir);
    assertEquals(dirInfo.atime, atime);
    assertEquals(dirInfo.mtime, mtime);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeFileDateSuccess() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    Oden.writeFileSync(filename, new TextEncoder().encode("hello"), {
      mode: 0o666,
    });

    const atime = new Date();
    const mtime = new Date();
    await Oden.utime(filename, atime, mtime);

    const fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.atime, atime);
    assertEquals(fileInfo.mtime, mtime);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function utimeNotFound() {
    const atime = 1000;
    const mtime = 50000;

    await assertRejects(
      async () => {
        await Oden.utime("/baddir", atime, mtime);
      },
      Oden.errors.NotFound,
      "utime '/baddir'",
    );
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  async function utimeSyncPerm() {
    const atime = 1000;
    const mtime = 50000;

    await assertRejects(async () => {
      await Oden.utime("/some_dir", atime, mtime);
    }, Oden.errors.NotCapable);
  },
);
