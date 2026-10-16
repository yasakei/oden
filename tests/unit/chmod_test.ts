// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

let modeAsync: number;
let modeSync: number;
// On Windows chmod is only able to manipulate write permission
if (Oden.build.os === "windows") {
  modeAsync = 0o444; // read-only
  modeSync = 0o666; // read-write
} else {
  modeAsync = 0o777;
  modeSync = 0o644;
}

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  function chmodSyncSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });

    Oden.chmodSync(filename, modeSync);

    const fileInfo = Oden.statSync(filename);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeSync);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  function chmodSyncUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(`file://${tempDir}/test.txt`);
    Oden.writeFileSync(fileUrl, data, { mode: 0o666 });

    Oden.chmodSync(fileUrl, modeSync);

    const fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeSync);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

// Check symlink when not on windows
Oden.test(
  {
    permissions: { read: true, write: true },
  },
  function chmodSyncSymlinkSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();

    const filename = tempDir + "/test.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });
    const symlinkName = tempDir + "/test_symlink.txt";
    Oden.symlinkSync(filename, symlinkName);

    let symlinkInfo = Oden.lstatSync(symlinkName);
    assert(symlinkInfo.mode);
    const symlinkMode = symlinkInfo.mode & 0o777; // platform dependent

    Oden.chmodSync(symlinkName, modeSync);

    // Change actual file mode, not symlink
    const fileInfo = Oden.statSync(filename);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeSync);

    symlinkInfo = Oden.lstatSync(symlinkName);
    assert(symlinkInfo.mode);
    assertEquals(symlinkInfo.mode & 0o777, symlinkMode);
  },
);

Oden.test({ permissions: { write: true } }, function chmodSyncFailure() {
  const filename = "/badfile.txt";
  assertThrows(
    () => {
      Oden.chmodSync(filename, 0o777);
    },
    Oden.errors.NotFound,
    `chmod '${filename}'`,
  );
});

Oden.test({ permissions: { write: false } }, function chmodSyncPerm() {
  assertThrows(() => {
    Oden.chmodSync("/somefile.txt", 0o777);
  }, Oden.errors.NotCapable);
});

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  async function chmodSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });

    await Oden.chmod(filename, modeAsync);

    const fileInfo = Oden.statSync(filename);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeAsync);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  async function chmodUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(`file://${tempDir}/test.txt`);
    Oden.writeFileSync(fileUrl, data, { mode: 0o666 });

    await Oden.chmod(fileUrl, modeAsync);

    const fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeAsync);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  async function chmodSymlinkSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();

    const filename = tempDir + "/test.txt";
    Oden.writeFileSync(filename, data, { mode: 0o666 });
    const symlinkName = tempDir + "/test_symlink.txt";
    Oden.symlinkSync(filename, symlinkName);

    let symlinkInfo = Oden.lstatSync(symlinkName);
    assert(symlinkInfo.mode);
    const symlinkMode = symlinkInfo.mode & 0o777; // platform dependent

    await Oden.chmod(symlinkName, modeAsync);

    // Just change actual file mode, not symlink
    const fileInfo = Oden.statSync(filename);
    assert(fileInfo.mode);
    assertEquals(fileInfo.mode & 0o777, modeAsync);

    symlinkInfo = Oden.lstatSync(symlinkName);
    assert(symlinkInfo.mode);
    assertEquals(symlinkInfo.mode & 0o777, symlinkMode);
  },
);

Oden.test({ permissions: { write: true } }, async function chmodFailure() {
  const filename = "/badfile.txt";
  await assertRejects(
    async () => {
      await Oden.chmod(filename, 0o777);
    },
    Oden.errors.NotFound,
    `chmod '${filename}'`,
  );
});

Oden.test({ permissions: { write: false } }, async function chmodPerm() {
  await assertRejects(async () => {
    await Oden.chmod("/somefile.txt", 0o777);
  }, Oden.errors.NotCapable);
});
