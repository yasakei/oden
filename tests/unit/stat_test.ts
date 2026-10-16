// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  function statSyncSuccess() {
    const readmeInfo = Oden.statSync("README.md");
    assert(readmeInfo.isFile);
    assert(!readmeInfo.isSymlink);

    const modulesInfo = Oden.statSync("tests/testdata/symlink_to_subdir");
    assert(modulesInfo.isDirectory);
    assert(!modulesInfo.isSymlink);

    const testsInfo = Oden.statSync("tests");
    assert(testsInfo.isDirectory);
    assert(!testsInfo.isSymlink);

    const tempFile = Oden.makeTempFileSync();
    const tempInfo = Oden.statSync(tempFile);
    const now = Date.now();
    assert(tempInfo.atime !== null && now - tempInfo.atime.valueOf() < 60_000);
    assert(tempInfo.mtime !== null && now - tempInfo.mtime.valueOf() < 60_000);
    assert(tempInfo.ctime !== null && now - tempInfo.ctime.valueOf() < 60_000);
    const mode = tempInfo.mode! & 0o777;
    if (Oden.build.os === "windows") {
      assertEquals(mode, 0o666);
    } else {
      assertEquals(mode, 0o600);
    }

    const readmeInfoByUrl = Oden.statSync(pathToAbsoluteFileUrl("README.md"));
    assert(readmeInfoByUrl.isFile);
    assert(!readmeInfoByUrl.isSymlink);

    const modulesInfoByUrl = Oden.statSync(
      pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
    );
    assert(modulesInfoByUrl.isDirectory);
    assert(!modulesInfoByUrl.isSymlink);

    const testsInfoByUrl = Oden.statSync(pathToAbsoluteFileUrl("tests"));
    assert(testsInfoByUrl.isDirectory);
    assert(!testsInfoByUrl.isSymlink);

    const tempFileForUrl = Oden.makeTempFileSync();
    const tempInfoByUrl = Oden.statSync(
      new URL(
        `file://${Oden.build.os === "windows" ? "/" : ""}${tempFileForUrl}`,
      ),
    );
    assert(tempInfoByUrl.atime !== null);
    assert(tempInfoByUrl.mtime !== null);
    assert(tempInfoByUrl.ctime !== null);

    Oden.removeSync(tempFile, { recursive: true });
    Oden.removeSync(tempFileForUrl, { recursive: true });
  },
);

Oden.test({ permissions: { read: false } }, function statSyncPerm() {
  assertThrows(() => {
    Oden.statSync("README.md");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function statSyncNotFound() {
  assertThrows(
    () => {
      Oden.statSync("bad_file_name");
    },
    Oden.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Oden.test({ permissions: { read: true } }, function lstatSyncSuccess() {
  const packageInfo = Oden.lstatSync("README.md");
  assert(packageInfo.isFile);
  assert(!packageInfo.isSymlink);

  const packageInfoByUrl = Oden.lstatSync(pathToAbsoluteFileUrl("README.md"));
  assert(packageInfoByUrl.isFile);
  assert(!packageInfoByUrl.isSymlink);

  const modulesInfo = Oden.lstatSync("tests/testdata/symlink_to_subdir");
  assert(!modulesInfo.isDirectory);
  assert(modulesInfo.isSymlink);

  const modulesInfoByUrl = Oden.lstatSync(
    pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
  );
  assert(!modulesInfoByUrl.isDirectory);
  assert(modulesInfoByUrl.isSymlink);

  const coreInfo = Oden.lstatSync("cli");
  assert(coreInfo.isDirectory);
  assert(!coreInfo.isSymlink);

  const coreInfoByUrl = Oden.lstatSync(pathToAbsoluteFileUrl("cli"));
  assert(coreInfoByUrl.isDirectory);
  assert(!coreInfoByUrl.isSymlink);
});

Oden.test({ permissions: { read: false } }, function lstatSyncPerm() {
  assertThrows(() => {
    Oden.lstatSync("assets/hello.txt");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function lstatSyncNotFound() {
  assertThrows(
    () => {
      Oden.lstatSync("bad_file_name");
    },
    Oden.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Oden.test(
  { permissions: { read: true, write: true } },
  async function statSuccess() {
    const readmeInfo = await Oden.stat("README.md");
    assert(readmeInfo.isFile);
    assert(!readmeInfo.isSymlink);

    const readmeInfoByUrl = await Oden.stat(
      pathToAbsoluteFileUrl("README.md"),
    );
    assert(readmeInfoByUrl.isFile);
    assert(!readmeInfoByUrl.isSymlink);

    const modulesInfo = await Oden.stat("tests/testdata/symlink_to_subdir");
    assert(modulesInfo.isDirectory);
    assert(!modulesInfo.isSymlink);

    const modulesInfoByUrl = await Oden.stat(
      pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
    );
    assert(modulesInfoByUrl.isDirectory);
    assert(!modulesInfoByUrl.isSymlink);

    const testsInfo = await Oden.stat("tests");
    assert(testsInfo.isDirectory);
    assert(!testsInfo.isSymlink);

    const testsInfoByUrl = await Oden.stat(pathToAbsoluteFileUrl("tests"));
    assert(testsInfoByUrl.isDirectory);
    assert(!testsInfoByUrl.isSymlink);

    const tempFile = await Oden.makeTempFile();
    const tempInfo = await Oden.stat(tempFile);
    assert(tempInfo.atime !== null);
    assert(tempInfo.mtime !== null);
    assert(tempInfo.ctime !== null);

    const tempFileForUrl = await Oden.makeTempFile();
    const tempInfoByUrl = await Oden.stat(
      new URL(
        `file://${Oden.build.os === "windows" ? "/" : ""}${tempFileForUrl}`,
      ),
    );
    assert(tempInfoByUrl.atime !== null);
    assert(tempInfoByUrl.mtime !== null);
    assert(tempInfoByUrl.ctime !== null);
    Oden.removeSync(tempFile, { recursive: true });
    Oden.removeSync(tempFileForUrl, { recursive: true });
  },
);

Oden.test({ permissions: { read: false } }, async function statPerm() {
  await assertRejects(async () => {
    await Oden.stat("README.md");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, async function statNotFound() {
  await assertRejects(
    async () => {
      await Oden.stat("bad_file_name");
    },
    Oden.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Oden.test({ permissions: { read: true } }, async function lstatSuccess() {
  const readmeInfo = await Oden.lstat("README.md");
  assert(readmeInfo.isFile);
  assert(!readmeInfo.isSymlink);

  const readmeInfoByUrl = await Oden.lstat(pathToAbsoluteFileUrl("README.md"));
  assert(readmeInfoByUrl.isFile);
  assert(!readmeInfoByUrl.isSymlink);

  const modulesInfo = await Oden.lstat("tests/testdata/symlink_to_subdir");
  assert(!modulesInfo.isDirectory);
  assert(modulesInfo.isSymlink);

  const modulesInfoByUrl = await Oden.lstat(
    pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
  );
  assert(!modulesInfoByUrl.isDirectory);
  assert(modulesInfoByUrl.isSymlink);

  const coreInfo = await Oden.lstat("cli");
  assert(coreInfo.isDirectory);
  assert(!coreInfo.isSymlink);

  const coreInfoByUrl = await Oden.lstat(pathToAbsoluteFileUrl("cli"));
  assert(coreInfoByUrl.isDirectory);
  assert(!coreInfoByUrl.isSymlink);
});

Oden.test({ permissions: { read: false } }, async function lstatPerm() {
  await assertRejects(async () => {
    await Oden.lstat("README.md");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, async function lstatNotFound() {
  await assertRejects(
    async () => {
      await Oden.lstat("bad_file_name");
    },
    Oden.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { read: true, write: true },
  },
  function statNoUnixFields() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });
    const s = Oden.statSync(filename);
    assert(s.dev !== 0);
    assert(s.ino !== null);
    assert(s.nlink !== null);
    assert(s.uid === null);
    assert(s.gid === null);
    assert(s.rdev === null);
    assert(s.blksize === null);
    assert(s.blocks !== null);
    assert(s.isBlockDevice === null);
    assert(s.isCharDevice === null);
    assert(s.isFifo === null);
    assert(s.isSocket === null);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { read: true, write: true },
  },
  function statUnixFields() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    const filename2 = tempDir + "/test2.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });
    // Create a link
    Oden.linkSync(filename, filename2);
    const s = Oden.statSync(filename);
    assert(s.dev !== null);
    assert(s.ino !== null);
    assertEquals(s.mode! & 0o666, 0o666);
    assertEquals(s.nlink, 2);
    assert(s.uid !== null);
    assert(s.gid !== null);
    assert(s.rdev !== null);
    assert(s.blksize !== null);
    assert(s.blocks !== null);
    assert(!s.isBlockDevice);
    assert(!s.isCharDevice);
    assert(!s.isFifo);
    assert(!s.isSocket);
  },
);

Oden.test(
  { permissions: { read: false, write: true } },
  async function fsFileStatFailPermissions() {
    const testDir = Oden.makeTempDirSync();
    const filename = testDir + "/file.txt";
    using file = await Oden.open(filename, {
      read: false,
      write: true,
      create: true,
    });

    await assertRejects(
      () => file.stat(),
      Oden.errors.NotCapable,
      "Requires read access to",
    );
    assertThrows(
      () => file.statSync(),
      Oden.errors.NotCapable,
      "Requires read access to",
    );
  },
);
