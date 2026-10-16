// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  function symlinkSyncSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    Oden.symlinkSync(oldname, newname);
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink);
    assert(newNameInfoStat.isDirectory);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function symlinkSyncURL() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    Oden.symlinkSync(
      pathToAbsoluteFileUrl(oldname),
      pathToAbsoluteFileUrl(newname),
    );
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink);
    assert(newNameInfoStat.isDirectory);
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { read: true, write: true },
  },
  function symlinkSyncJunction() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    Oden.symlinkSync(oldname, newname, { type: "junction" });
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink);
    assert(newNameInfoStat.isDirectory);
  },
);

Oden.test(
  { permissions: { read: false, write: false } },
  function symlinkSyncPerm() {
    assertThrows(() => {
      Oden.symlinkSync("oldbaddir", "newbaddir");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function symlinkSyncAlreadyExist() {
    const existingFile = Oden.makeTempFileSync();
    const existingFile2 = Oden.makeTempFileSync();
    assertThrows(
      () => {
        Oden.symlinkSync(existingFile, existingFile2);
      },
      Oden.errors.AlreadyExists,
      `symlink '${existingFile}' -> '${existingFile2}'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function symlinkSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    await Oden.symlink(oldname, newname);
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink, "NOT SYMLINK");
    assert(newNameInfoStat.isDirectory, "NOT DIRECTORY");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function symlinkURL() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    await Oden.symlink(
      pathToAbsoluteFileUrl(oldname),
      pathToAbsoluteFileUrl(newname),
    );
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink, "NOT SYMLINK");
    assert(newNameInfoStat.isDirectory, "NOT DIRECTORY");
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { read: true, write: true },
  },
  async function symlinkJunction() {
    const testDir = Oden.makeTempDirSync();
    const oldname = testDir + "/oldname";
    const newname = testDir + "/newname";
    Oden.mkdirSync(oldname);
    await Oden.symlink(oldname, newname, { type: "junction" });
    const newNameInfoLStat = Oden.lstatSync(newname);
    const newNameInfoStat = Oden.statSync(newname);
    assert(newNameInfoLStat.isSymlink, "NOT SYMLINK");
    assert(newNameInfoStat.isDirectory, "NOT DIRECTORY");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function symlinkAlreadyExist() {
    const existingFile = Oden.makeTempFileSync();
    const existingFile2 = Oden.makeTempFileSync();
    await assertRejects(
      async () => {
        await Oden.symlink(existingFile, existingFile2);
      },
      Oden.errors.AlreadyExists,
      `symlink '${existingFile}' -> '${existingFile2}'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: ["."] } },
  async function symlinkNoFullWritePermissions() {
    await assertRejects(
      () => Oden.symlink("old", "new"),
      Oden.errors.NotCapable,
    );
    assertThrows(
      () => Oden.symlinkSync("old", "new"),
      Oden.errors.NotCapable,
    );
  },
);

Oden.test(
  { permissions: { read: ["."], write: true } },
  async function symlinkNoFullReadPermissions() {
    await assertRejects(
      () => Oden.symlink("old", "new"),
      Oden.errors.NotCapable,
    );
    assertThrows(
      () => Oden.symlinkSync("old", "new"),
      Oden.errors.NotCapable,
    );
  },
);
