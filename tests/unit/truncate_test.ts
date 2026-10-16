// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertRejects, assertThrows } from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  function ftruncateSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_ftruncateSync.txt";
    using file = Oden.openSync(filename, {
      create: true,
      read: true,
      write: true,
    });

    file.truncateSync(20);
    assertEquals(Oden.readFileSync(filename).byteLength, 20);
    file.truncateSync(5);
    assertEquals(Oden.readFileSync(filename).byteLength, 5);
    file.truncateSync(-5);
    assertEquals(Oden.readFileSync(filename).byteLength, 0);

    Oden.removeSync(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function ftruncateSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_ftruncate.txt";
    using file = await Oden.open(filename, {
      create: true,
      read: true,
      write: true,
    });

    await file.truncate(20);
    assertEquals((await Oden.readFile(filename)).byteLength, 20);
    await file.truncate(5);
    assertEquals((await Oden.readFile(filename)).byteLength, 5);
    await file.truncate(-5);
    assertEquals((await Oden.readFile(filename)).byteLength, 0);

    await Oden.remove(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function truncateSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_truncateSync.txt";
    Oden.writeFileSync(filename, new Uint8Array(5));
    Oden.truncateSync(filename, 20);
    assertEquals(Oden.readFileSync(filename).byteLength, 20);
    Oden.truncateSync(filename, 5);
    assertEquals(Oden.readFileSync(filename).byteLength, 5);
    Oden.truncateSync(filename, -5);
    assertEquals(Oden.readFileSync(filename).byteLength, 0);
    Oden.removeSync(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function truncateSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_truncate.txt";
    await Oden.writeFile(filename, new Uint8Array(5));
    await Oden.truncate(filename, 20);
    assertEquals((await Oden.readFile(filename)).byteLength, 20);
    await Oden.truncate(filename, 5);
    assertEquals((await Oden.readFile(filename)).byteLength, 5);
    await Oden.truncate(filename, -5);
    assertEquals((await Oden.readFile(filename)).byteLength, 0);
    await Oden.remove(filename);
  },
);

Oden.test({ permissions: { write: false } }, function truncateSyncPerm() {
  assertThrows(() => {
    Oden.truncateSync("/test_truncateSyncPermission.txt");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { write: false } }, async function truncatePerm() {
  await assertRejects(async () => {
    await Oden.truncate("/test_truncatePermission.txt");
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { read: true, write: true } },
  function truncateSyncNotFound() {
    const filename = "/badfile.txt";
    assertThrows(
      () => {
        Oden.truncateSync(filename);
      },
      Oden.errors.NotFound,
      `truncate '${filename}'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function truncateSyncNotFound() {
    const filename = "/badfile.txt";
    await assertRejects(
      async () => {
        await Oden.truncate(filename);
      },
      Oden.errors.NotFound,
      `truncate '${filename}'`,
    );
  },
);

// truncate does not follow a terminal symlink: the permission check is done
// no-follow, so a symlink at an allowed path must not be usable to zero out a
// file it points to. The open uses O_NOFOLLOW and fails with FilesystemLoop
// (ELOOP) on a symlink target, rather than a permission error or silently
// truncating the link's target.
Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  function truncateSyncDoesNotFollowSymlink() {
    const dir = Oden.makeTempDirSync();
    const target = dir + "/target.txt";
    const link = dir + "/link.txt";
    Oden.writeFileSync(target, new Uint8Array([1, 2, 3, 4, 5]));
    Oden.symlinkSync(target, link);

    assertThrows(
      () => Oden.truncateSync(link, 0),
      Oden.errors.FilesystemLoop,
    );
    assertEquals(Oden.readFileSync(target).byteLength, 5);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  async function truncateDoesNotFollowSymlink() {
    const dir = Oden.makeTempDirSync();
    const target = dir + "/target.txt";
    const link = dir + "/link.txt";
    await Oden.writeFile(target, new Uint8Array([1, 2, 3, 4, 5]));
    await Oden.symlink(target, link);

    await assertRejects(
      () => Oden.truncate(link, 0),
      Oden.errors.FilesystemLoop,
    );
    assertEquals((await Oden.readFile(target)).byteLength, 5);
  },
);

// O_NOFOLLOW only protects the final path component. A symlink in an ancestor
// directory is still resolved, so truncating a regular file reached through a
// symlinked directory continues to work.
Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  function truncateSyncFollowsIntermediateSymlink() {
    const dir = Oden.makeTempDirSync();
    const realDir = dir + "/real";
    Oden.mkdirSync(realDir);
    const file = realDir + "/data.txt";
    Oden.writeFileSync(file, new Uint8Array([1, 2, 3, 4, 5]));
    const linkDir = dir + "/linkdir";
    Oden.symlinkSync(realDir, linkDir);

    Oden.truncateSync(linkDir + "/data.txt", 2);
    assertEquals(Oden.readFileSync(file).byteLength, 2);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  async function truncateFollowsIntermediateSymlink() {
    const dir = Oden.makeTempDirSync();
    const realDir = dir + "/real";
    await Oden.mkdir(realDir);
    const file = realDir + "/data.txt";
    await Oden.writeFile(file, new Uint8Array([1, 2, 3, 4, 5]));
    const linkDir = dir + "/linkdir";
    await Oden.symlink(realDir, linkDir);

    await Oden.truncate(linkDir + "/data.txt", 2);
    assertEquals((await Oden.readFile(file)).byteLength, 2);
  },
);
