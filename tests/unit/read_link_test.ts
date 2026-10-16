// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Oden.test(
  { permissions: { write: true, read: true } },
  function readLinkSyncSuccess() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir +
      (Oden.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Oden.build.os == "windows" ? "\\symlink" : "/symlink");
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const targetPath = Oden.readLinkSync(symlink);
    assertEquals(targetPath, target);
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  function readLinkSyncUrlSuccess() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir +
      (Oden.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Oden.build.os == "windows" ? "\\symlink" : "/symlink");
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const targetPath = Oden.readLinkSync(pathToAbsoluteFileUrl(symlink));
    assertEquals(targetPath, target);
  },
);

Oden.test({ permissions: { read: false } }, function readLinkSyncPerm() {
  assertThrows(() => {
    Oden.readLinkSync("/symlink");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readLinkSyncNotFound() {
  assertThrows(
    () => {
      Oden.readLinkSync("bad_filename");
    },
    Oden.errors.NotFound,
    `readlink 'bad_filename'`,
  );
});

Oden.test(
  { permissions: { write: true, read: true } },
  async function readLinkSuccess() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir +
      (Oden.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Oden.build.os == "windows" ? "\\symlink" : "/symlink");
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const targetPath = await Oden.readLink(symlink);
    assertEquals(targetPath, target);
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function readLinkUrlSuccess() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir +
      (Oden.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Oden.build.os == "windows" ? "\\symlink" : "/symlink");
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const targetPath = await Oden.readLink(pathToAbsoluteFileUrl(symlink));
    assertEquals(targetPath, target);
  },
);

Oden.test({ permissions: { read: false } }, async function readLinkPerm() {
  await assertRejects(async () => {
    await Oden.readLink("/symlink");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, async function readLinkNotFound() {
  await assertRejects(
    async () => {
      await Oden.readLink("bad_filename");
    },
    Oden.errors.NotFound,
    `readlink 'bad_filename'`,
  );
});
