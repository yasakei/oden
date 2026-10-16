// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

function assertDirectory(path: string, mode?: number) {
  const info = Oden.lstatSync(path);
  assert(info.isDirectory);
  if (Oden.build.os !== "windows" && mode !== undefined) {
    assertEquals(info.mode! & 0o777, mode & ~Oden.umask());
  }
}

Oden.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncSuccess() {
    const path = Oden.makeTempDirSync() + "/dir";
    Oden.mkdirSync(path);
    assertDirectory(path);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncMode() {
    const path = Oden.makeTempDirSync() + "/dir";
    Oden.mkdirSync(path, { mode: 0o737 });
    assertDirectory(path, 0o737);
  },
);

Oden.test({ permissions: { write: false } }, function mkdirSyncPerm() {
  assertThrows(() => {
    Oden.mkdirSync("/baddir");
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { read: true, write: true } },
  async function mkdirSuccess() {
    const path = Oden.makeTempDirSync() + "/dir";
    await Oden.mkdir(path);
    assertDirectory(path);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirMode() {
    const path = Oden.makeTempDirSync() + "/dir";
    await Oden.mkdir(path, { mode: 0o737 });
    assertDirectory(path, 0o737);
  },
);

Oden.test({ permissions: { write: true } }, function mkdirErrSyncIfExists() {
  assertThrows(
    () => {
      Oden.mkdirSync(".");
    },
    Oden.errors.AlreadyExists,
    `mkdir '.'`,
  );
});

Oden.test({ permissions: { write: true } }, async function mkdirErrIfExists() {
  await assertRejects(
    async () => {
      await Oden.mkdir(".");
    },
    Oden.errors.AlreadyExists,
    `mkdir '.'`,
  );
});

Oden.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncRecursive() {
    const path = Oden.makeTempDirSync() + "/nested/directory";
    Oden.mkdirSync(path, { recursive: true });
    assertDirectory(path);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function mkdirRecursive() {
    const path = Oden.makeTempDirSync() + "/nested/directory";
    await Oden.mkdir(path, { recursive: true });
    assertDirectory(path);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncRecursiveMode() {
    const nested = Oden.makeTempDirSync() + "/nested";
    const path = nested + "/dir";
    Oden.mkdirSync(path, { mode: 0o737, recursive: true });
    assertDirectory(path, 0o737);
    assertDirectory(nested, 0o737);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirRecursiveMode() {
    const nested = Oden.makeTempDirSync() + "/nested";
    const path = nested + "/dir";
    await Oden.mkdir(path, { mode: 0o737, recursive: true });
    assertDirectory(path, 0o737);
    assertDirectory(nested, 0o737);
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncRecursiveIfExists() {
    const path = Oden.makeTempDirSync() + "/dir";
    Oden.mkdirSync(path, { mode: 0o737 });
    Oden.mkdirSync(path, { recursive: true });
    Oden.mkdirSync(path, { recursive: true, mode: 0o731 });
    assertDirectory(path, 0o737);
    if (Oden.build.os !== "windows") {
      const pathLink = path + "Link";
      Oden.symlinkSync(path, pathLink);
      Oden.mkdirSync(pathLink, { recursive: true });
      Oden.mkdirSync(pathLink, { recursive: true, mode: 0o731 });
      assertDirectory(path, 0o737);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirRecursiveIfExists() {
    const path = Oden.makeTempDirSync() + "/dir";
    await Oden.mkdir(path, { mode: 0o737 });
    await Oden.mkdir(path, { recursive: true });
    await Oden.mkdir(path, { recursive: true, mode: 0o731 });
    assertDirectory(path, 0o737);
    if (Oden.build.os !== "windows") {
      const pathLink = path + "Link";
      Oden.symlinkSync(path, pathLink);
      await Oden.mkdir(pathLink, { recursive: true });
      await Oden.mkdir(pathLink, { recursive: true, mode: 0o731 });
      assertDirectory(path, 0o737);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncErrors() {
    const testDir = Oden.makeTempDirSync();
    const emptydir = testDir + "/empty";
    const fulldir = testDir + "/dir";
    const file = fulldir + "/file";
    Oden.mkdirSync(emptydir);
    Oden.mkdirSync(fulldir);
    Oden.createSync(file).close();

    assertThrows(() => {
      Oden.mkdirSync(emptydir, { recursive: false });
    }, Oden.errors.AlreadyExists);
    assertThrows(() => {
      Oden.mkdirSync(fulldir, { recursive: false });
    }, Oden.errors.AlreadyExists);
    assertThrows(() => {
      Oden.mkdirSync(file, { recursive: false });
    }, Oden.errors.AlreadyExists);
    assertThrows(() => {
      Oden.mkdirSync(file, { recursive: true });
    }, Oden.errors.AlreadyExists);

    if (Oden.build.os !== "windows") {
      const fileLink = testDir + "/fileLink";
      const dirLink = testDir + "/dirLink";
      const danglingLink = testDir + "/danglingLink";
      Oden.symlinkSync(file, fileLink);
      Oden.symlinkSync(emptydir, dirLink);
      Oden.symlinkSync(testDir + "/nonexistent", danglingLink);

      assertThrows(() => {
        Oden.mkdirSync(dirLink, { recursive: false });
      }, Oden.errors.AlreadyExists);
      assertThrows(() => {
        Oden.mkdirSync(fileLink, { recursive: false });
      }, Oden.errors.AlreadyExists);
      assertThrows(() => {
        Oden.mkdirSync(fileLink, { recursive: true });
      }, Oden.errors.AlreadyExists);
      assertThrows(() => {
        Oden.mkdirSync(danglingLink, { recursive: false });
      }, Oden.errors.AlreadyExists);
      assertThrows(() => {
        Oden.mkdirSync(danglingLink, { recursive: true });
      }, Oden.errors.AlreadyExists);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncRelativeUrlPath() {
    const testDir = Oden.makeTempDirSync();
    const nestedDir = testDir + "/nested";
    // Add trailing slash so base path is treated as a directory. pathToAbsoluteFileUrl removes trailing slashes.
    const path = new URL("../dir", pathToAbsoluteFileUrl(nestedDir) + "/");

    Oden.mkdirSync(nestedDir);
    Oden.mkdirSync(path);

    assertDirectory(testDir + "/dir");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function mkdirRelativeUrlPath() {
    const testDir = Oden.makeTempDirSync();
    const nestedDir = testDir + "/nested";
    // Add trailing slash so base path is treated as a directory. pathToAbsoluteFileUrl removes trailing slashes.
    const path = new URL("../dir", pathToAbsoluteFileUrl(nestedDir) + "/");

    await Oden.mkdir(nestedDir);
    await Oden.mkdir(path);

    assertDirectory(testDir + "/dir");
  },
);
