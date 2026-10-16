// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  function writeTextFileSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test.txt";
    Oden.writeTextFileSync(filename, "Hello");
    const dataRead = Oden.readTextFileSync(filename);
    assertEquals(dataRead, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeTextFileSyncByUrl() {
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    Oden.writeTextFileSync(fileUrl, "Hello");
    const dataRead = Oden.readTextFileSync(fileUrl);
    assertEquals(dataRead, "Hello");

    Oden.removeSync(fileUrl, { recursive: true });
  },
);

Oden.test({ permissions: { write: true } }, function writeTextFileSyncFail() {
  const filename = "/baddir/test.txt";
  // The following should fail because /baddir doesn't exist (hopefully).
  assertThrows(() => {
    Oden.writeTextFileSync(filename, "hello");
  }, Oden.errors.NotFound);
});

Oden.test({ permissions: { write: false } }, function writeTextFileSyncPerm() {
  const filename = "/baddir/test.txt";
  // The following should fail due to no write permission
  assertThrows(() => {
    Oden.writeTextFileSync(filename, "Hello");
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { read: true, write: true } },
  function writeTextFileSyncUpdateMode() {
    if (Oden.build.os !== "windows") {
      const data = "Hello";
      const filename = Oden.makeTempDirSync() + "/test.txt";
      Oden.writeTextFileSync(filename, data, { mode: 0o755 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o755);
      Oden.writeTextFileSync(filename, data, { mode: 0o666 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeTextFileSyncCreate() {
    const data = "Hello";
    const filename = Oden.makeTempDirSync() + "/test.txt";
    let caughtError = false;
    // if create turned off, the file won't be created
    try {
      Oden.writeTextFileSync(filename, data, { create: false });
    } catch (e) {
      caughtError = true;
      assert(e instanceof Oden.errors.NotFound);
    }
    assert(caughtError);

    // Turn on create, should have no error
    Oden.writeTextFileSync(filename, data, { create: true });
    Oden.writeTextFileSync(filename, data, { create: false });
    assertEquals(Oden.readTextFileSync(filename), "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeTextFileSyncAppend() {
    const data = "Hello";
    const filename = Oden.makeTempDirSync() + "/test.txt";
    Oden.writeTextFileSync(filename, data);
    Oden.writeTextFileSync(filename, data, { append: true });
    assertEquals(Oden.readTextFileSync(filename), "HelloHello");
    // Now attempt overwrite
    Oden.writeTextFileSync(filename, data, { append: false });
    assertEquals(Oden.readTextFileSync(filename), "Hello");
    // append not set should also overwrite
    Oden.writeTextFileSync(filename, data);
    assertEquals(Oden.readTextFileSync(filename), "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileSuccess() {
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeTextFile(filename, "Hello");
    const dataRead = Oden.readTextFileSync(filename);
    assertEquals(dataRead, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileByUrl() {
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    await Oden.writeTextFile(fileUrl, "Hello");
    const dataRead = Oden.readTextFileSync(fileUrl);
    assertEquals(dataRead, "Hello");

    Oden.removeSync(fileUrl, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileNotFound() {
    const filename = "/baddir/test.txt";
    // The following should fail because /baddir doesn't exist (hopefully).
    await assertRejects(async () => {
      await Oden.writeTextFile(filename, "Hello");
    }, Oden.errors.NotFound);
  },
);

Oden.test(
  { permissions: { write: false } },
  async function writeTextFilePerm() {
    const filename = "/baddir/test.txt";
    // The following should fail due to no write permission
    await assertRejects(async () => {
      await Oden.writeTextFile(filename, "Hello");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileUpdateMode() {
    if (Oden.build.os !== "windows") {
      const data = "Hello";
      const filename = Oden.makeTempDirSync() + "/test.txt";
      await Oden.writeTextFile(filename, data, { mode: 0o755 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o755);
      await Oden.writeTextFile(filename, data, { mode: 0o666 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileCreate() {
    const data = "Hello";
    const filename = Oden.makeTempDirSync() + "/test.txt";
    let caughtError = false;
    // if create turned off, the file won't be created
    try {
      await Oden.writeTextFile(filename, data, { create: false });
    } catch (e) {
      caughtError = true;
      assert(e instanceof Oden.errors.NotFound);
    }
    assert(caughtError);

    // Turn on create, should have no error
    await Oden.writeTextFile(filename, data, { create: true });
    await Oden.writeTextFile(filename, data, { create: false });
    assertEquals(Oden.readTextFileSync(filename), "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileAppend() {
    const data = "Hello";
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeTextFile(filename, data);
    await Oden.writeTextFile(filename, data, { append: true });
    assertEquals(Oden.readTextFileSync(filename), "HelloHello");
    // Now attempt overwrite
    await Oden.writeTextFile(filename, data, { append: false });
    assertEquals(Oden.readTextFileSync(filename), "Hello");
    // append not set should also overwrite
    await Oden.writeTextFile(filename, data);
    assertEquals(Oden.readTextFileSync(filename), "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeTextFileStream() {
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue("Hello");
        controller.enqueue("World");
        controller.close();
      },
    });
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeTextFile(filename, stream);
    assertEquals(Oden.readTextFileSync(filename), "HelloWorld");
  },
);
