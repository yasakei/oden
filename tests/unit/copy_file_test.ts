// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertRejects, assertThrows } from "./test_util.ts";
import { join } from "@std/path";

function readFileString(filename: string | URL): string {
  const dataRead = Oden.readFileSync(filename);
  const dec = new TextDecoder("utf-8");
  return dec.decode(dataRead);
}

function writeFileString(filename: string | URL, s: string) {
  const enc = new TextEncoder();
  const data = enc.encode(s);
  Oden.writeFileSync(filename, data, { mode: 0o666 });
}

function assertSameContent(
  filename1: string | URL,
  filename2: string | URL,
) {
  const data1 = Oden.readFileSync(filename1);
  const data2 = Oden.readFileSync(filename2);
  assertEquals(data1, data2);
}

Oden.test(
  { permissions: { read: true, write: true } },
  function copyFileSyncSuccess() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = tempDir + "/from.txt";
    const toFilename = tempDir + "/to.txt";
    writeFileString(fromFilename, "Hello world!");
    Oden.copyFileSync(fromFilename, toFilename);
    // No change to original file
    assertEquals(readFileString(fromFilename), "Hello world!");
    // Original == Dest
    assertSameContent(fromFilename, toFilename);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function copyFileSyncByUrl() {
    const tempDir = Oden.makeTempDirSync();
    const fromUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/from.txt`,
    );
    const toUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/to.txt`,
    );
    writeFileString(fromUrl, "Hello world!");
    Oden.copyFileSync(fromUrl, toUrl);
    // No change to original file
    assertEquals(readFileString(fromUrl), "Hello world!");
    // Original == Dest
    assertSameContent(fromUrl, toUrl);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  function copyFileSyncFailure() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = join(tempDir, "from.txt");
    const toFilename = join(tempDir, "to.txt");
    // We skip initial writing here, from.txt does not exist
    assertThrows(
      () => {
        Oden.copyFileSync(fromFilename, toFilename);
      },
      Oden.errors.NotFound,
      `copy '${fromFilename}' -> '${toFilename}'`,
    );

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: true, read: false } },
  function copyFileSyncPerm1() {
    assertThrows(() => {
      Oden.copyFileSync("/from.txt", "/to.txt");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { write: false, read: true } },
  function copyFileSyncPerm2() {
    assertThrows(() => {
      Oden.copyFileSync("/from.txt", "/to.txt");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function copyFileSyncOverwrite() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = tempDir + "/from.txt";
    const toFilename = tempDir + "/to.txt";
    writeFileString(fromFilename, "Hello world!");
    // Make Dest exist and have different content
    writeFileString(toFilename, "Goodbye!");
    Oden.copyFileSync(fromFilename, toFilename);
    // No change to original file
    assertEquals(readFileString(fromFilename), "Hello world!");
    // Original == Dest
    assertSameContent(fromFilename, toFilename);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileSuccess() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = tempDir + "/from.txt";
    const toFilename = tempDir + "/to.txt";
    writeFileString(fromFilename, "Hello world!");
    await Oden.copyFile(fromFilename, toFilename);
    // No change to original file
    assertEquals(readFileString(fromFilename), "Hello world!");
    // Original == Dest
    assertSameContent(fromFilename, toFilename);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileByUrl() {
    const tempDir = Oden.makeTempDirSync();
    const fromUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/from.txt`,
    );
    const toUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/to.txt`,
    );
    writeFileString(fromUrl, "Hello world!");
    await Oden.copyFile(fromUrl, toUrl);
    // No change to original file
    assertEquals(readFileString(fromUrl), "Hello world!");
    // Original == Dest
    assertSameContent(fromUrl, toUrl);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileFailure() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = join(tempDir, "from.txt");
    const toFilename = join(tempDir, "to.txt");
    // We skip initial writing here, from.txt does not exist
    await assertRejects(
      async () => {
        await Oden.copyFile(fromFilename, toFilename);
      },
      Oden.errors.NotFound,
      `copy '${fromFilename}' -> '${toFilename}'`,
    );

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileOverwrite() {
    const tempDir = Oden.makeTempDirSync();
    const fromFilename = tempDir + "/from.txt";
    const toFilename = tempDir + "/to.txt";
    writeFileString(fromFilename, "Hello world!");
    // Make Dest exist and have different content
    writeFileString(toFilename, "Goodbye!");
    await Oden.copyFile(fromFilename, toFilename);
    // No change to original file
    assertEquals(readFileString(fromFilename), "Hello world!");
    // Original == Dest
    assertSameContent(fromFilename, toFilename);

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: false, write: true } },
  async function copyFilePerm1() {
    await assertRejects(async () => {
      await Oden.copyFile("/from.txt", "/to.txt");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  async function copyFilePerm2() {
    await assertRejects(async () => {
      await Oden.copyFile("/from.txt", "/to.txt");
    }, Oden.errors.NotCapable);
  },
);

function copyFileSyncMode(content: string): void {
  const tempDir = Oden.makeTempDirSync();
  const fromFilename = tempDir + "/from.txt";
  const toFilename = tempDir + "/to.txt";
  Oden.writeTextFileSync(fromFilename, content);
  Oden.chmodSync(fromFilename, 0o100755);

  Oden.copyFileSync(fromFilename, toFilename);
  const toStat = Oden.statSync(toFilename);
  assertEquals(toStat.mode!, 0o100755);
}

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { read: true, write: true },
  },
  function copyFileSyncChmod() {
    // this Tests different optimization paths on MacOS:
    //
    // < 128 KB clonefile() w/ fallback to copyfile()
    // > 128 KB
    copyFileSyncMode("Hello world!");
    copyFileSyncMode("Hello world!".repeat(128 * 1024));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileNulPath() {
    const fromFilename = "from.txt\0";
    const toFilename = "to.txt\0";
    await assertRejects(async () => {
      await Oden.copyFile(fromFilename, toFilename);
    }, TypeError);
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "linux",
    permissions: { read: true, write: true },
  },
  async function copyFileProc() {
    // should not be able to copy from /proc without --allow-all permissions
    assertThrows(
      () => Oden.copyFileSync("/proc/self/status", "data.txt"),
      Oden.errors.NotCapable,
    );
    await assertRejects(
      () => Oden.copyFile("/proc/self/status", "data.txt"),
      Oden.errors.NotCapable,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function copyFileSyncSamePathThrows() {
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/file.txt";
    writeFileString(filename, "Hello world!");
    // Copying a file onto itself must not truncate it.
    assertThrows(() => Oden.copyFileSync(filename, filename), TypeError);
    // An equivalent-but-different path resolving to the same file too.
    Oden.mkdirSync(tempDir + "/sub");
    assertThrows(
      () => Oden.copyFileSync(filename, tempDir + "/sub/../file.txt"),
      TypeError,
    );
    assertEquals(readFileString(filename), "Hello world!");
    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function copyFileSamePathThrows() {
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "/file.txt";
    writeFileString(filename, "Hello world!");
    await assertRejects(() => Oden.copyFile(filename, filename), TypeError);
    assertEquals(readFileString(filename), "Hello world!");
    Oden.removeSync(tempDir, { recursive: true });
  },
);
