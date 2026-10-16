// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  AssertionError,
  assertIsError,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

function assertMissing(path: string) {
  let caughtErr = false;
  let info;
  try {
    info = Oden.lstatSync(path);
  } catch (e) {
    caughtErr = true;
    assert(e instanceof Oden.errors.NotFound);
  }
  assert(caughtErr);
  assertEquals(info, undefined);
}

function assertFile(path: string) {
  const info = Oden.lstatSync(path);
  assert(info.isFile);
}

function assertDirectory(path: string, mode?: number) {
  const info = Oden.lstatSync(path);
  assert(info.isDirectory);
  if (Oden.build.os !== "windows" && mode !== undefined) {
    assertEquals(info.mode! & 0o777, mode & ~Oden.umask());
  }
}

Oden.test(
  { permissions: { read: true, write: true } },
  function renameSyncSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldpath = testDir + "/oldpath";
    const newpath = testDir + "/newpath";
    Oden.mkdirSync(oldpath);
    Oden.renameSync(oldpath, newpath);
    assertDirectory(newpath);
    assertMissing(oldpath);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function renameSyncWithURL() {
    const testDir = Oden.makeTempDirSync();
    const oldpath = testDir + "/oldpath";
    const newpath = testDir + "/newpath";
    Oden.mkdirSync(oldpath);
    Oden.renameSync(
      pathToAbsoluteFileUrl(oldpath),
      pathToAbsoluteFileUrl(newpath),
    );
    assertDirectory(newpath);
    assertMissing(oldpath);
  },
);

Oden.test(
  { permissions: { read: false, write: true } },
  function renameSyncReadPerm() {
    assertThrows(() => {
      const oldpath = "/oldbaddir";
      const newpath = "/newbaddir";
      Oden.renameSync(oldpath, newpath);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  function renameSyncWritePerm() {
    assertThrows(() => {
      const oldpath = "/oldbaddir";
      const newpath = "/newbaddir";
      Oden.renameSync(oldpath, newpath);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function renameSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldpath = testDir + "/oldpath";
    const newpath = testDir + "/newpath";
    Oden.mkdirSync(oldpath);
    await Oden.rename(oldpath, newpath);
    assertDirectory(newpath);
    assertMissing(oldpath);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function renameWithURL() {
    const testDir = Oden.makeTempDirSync();
    const oldpath = testDir + "/oldpath";
    const newpath = testDir + "/newpath";
    Oden.mkdirSync(oldpath);
    await Oden.rename(
      pathToAbsoluteFileUrl(oldpath),
      pathToAbsoluteFileUrl(newpath),
    );
    assertDirectory(newpath);
    assertMissing(oldpath);
  },
);

function readFileString(filename: string): string {
  const dataRead = Oden.readFileSync(filename);
  const dec = new TextDecoder("utf-8");
  return dec.decode(dataRead);
}

function writeFileString(filename: string, s: string) {
  const enc = new TextEncoder();
  const data = enc.encode(s);
  Oden.writeFileSync(filename, data, { mode: 0o666 });
}

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { read: true, write: true },
  },
  function renameSyncErrorsUnix() {
    const testDir = Oden.makeTempDirSync();
    const oldfile = testDir + "/oldfile";
    const olddir = testDir + "/olddir";
    const emptydir = testDir + "/empty";
    const fulldir = testDir + "/dir";
    const file = fulldir + "/file";
    writeFileString(oldfile, "Hello");
    Oden.mkdirSync(olddir);
    Oden.mkdirSync(emptydir);
    Oden.mkdirSync(fulldir);
    writeFileString(file, "world");

    assertThrows(
      () => {
        Oden.renameSync(oldfile, emptydir);
      },
      Error,
      "Is a directory",
    );
    try {
      assertThrows(
        () => {
          Oden.renameSync(olddir, fulldir);
        },
        Error,
        "Directory not empty",
      );
    } catch (e) {
      // rename syscall may also return EEXIST, e.g. with XFS
      assertIsError(
        e,
        AssertionError,
        `Expected error message to include "Directory not empty", but got "File exists`,
      );
    }
    assertThrows(
      () => {
        Oden.renameSync(olddir, file);
      },
      Error,
      "Not a directory",
    );
    assertThrows(
      () => {
        Oden.renameSync(olddir, file);
      },
      Error,
      `rename '${olddir}' -> '${file}'`,
    );

    const fileLink = testDir + "/fileLink";
    const dirLink = testDir + "/dirLink";
    const danglingLink = testDir + "/danglingLink";
    Oden.symlinkSync(file, fileLink);
    Oden.symlinkSync(emptydir, dirLink);
    Oden.symlinkSync(testDir + "/nonexistent", danglingLink);

    assertThrows(
      () => {
        Oden.renameSync(olddir, fileLink);
      },
      Error,
      "Not a directory",
    );
    assertThrows(
      () => {
        Oden.renameSync(olddir, dirLink);
      },
      Error,
      "Not a directory",
    );
    assertThrows(
      () => {
        Oden.renameSync(olddir, danglingLink);
      },
      Error,
      "Not a directory",
    );

    // should succeed on Unix
    Oden.renameSync(olddir, emptydir);
    Oden.renameSync(oldfile, dirLink);
    Oden.renameSync(dirLink, danglingLink);
    assertFile(danglingLink);
    assertEquals("Hello", readFileString(danglingLink));
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { read: true, write: true },
  },
  function renameSyncErrorsWin() {
    const testDir = Oden.makeTempDirSync();
    const oldfile = testDir + "/oldfile";
    const olddir = testDir + "/olddir";
    const emptydir = testDir + "/empty";
    const fulldir = testDir + "/dir";
    const file = fulldir + "/file";
    writeFileString(oldfile, "Hello");
    Oden.mkdirSync(olddir);
    Oden.mkdirSync(emptydir);
    Oden.mkdirSync(fulldir);
    writeFileString(file, "world");

    assertThrows(
      () => {
        Oden.renameSync(oldfile, emptydir);
      },
      Oden.errors.PermissionDenied,
      "Access is denied",
    );
    assertThrows(
      () => {
        Oden.renameSync(olddir, fulldir);
      },
      Error,
      "The directory is not empty",
    );

    // should succeed on Windows
    Oden.renameSync(olddir, emptydir);
    assertDirectory(emptydir);
  },
);
