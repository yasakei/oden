// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  unreachable,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    Oden.writeFileSync(filename, data);
    const dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    Oden.writeFileSync(fileUrl, data);
    const dataRead = Oden.readFileSync(fileUrl);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test({ permissions: { write: true } }, function writeFileSyncFail() {
  const enc = new TextEncoder();
  const data = enc.encode("Hello");
  const filename = "/baddir/test.txt";
  // The following should fail because /baddir doesn't exist (hopefully).
  assertThrows(() => {
    Oden.writeFileSync(filename, data);
  }, Oden.errors.NotFound);
});

Oden.test({ permissions: { write: false } }, function writeFileSyncPerm() {
  const enc = new TextEncoder();
  const data = enc.encode("Hello");
  const filename = "/baddir/test.txt";
  // The following should fail due to no write permission
  assertThrows(() => {
    Oden.writeFileSync(filename, data);
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncUpdateMode() {
    if (Oden.build.os !== "windows") {
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Oden.makeTempDirSync() + "/test.txt";
      Oden.writeFileSync(filename, data, { mode: 0o755 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o755);
      Oden.writeFileSync(filename, data, { mode: 0o666 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncCreate() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    // if create turned off, the file won't be created
    assertThrows(() => {
      Oden.writeFileSync(filename, data, { create: false });
    }, Oden.errors.NotFound);

    // Turn on create, should have no error
    Oden.writeFileSync(filename, data, { create: true });
    Oden.writeFileSync(filename, data, { create: false });
    const dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncCreateNew() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    Oden.writeFileSync(filename, data, { createNew: true });

    assertThrows(() => {
      Oden.writeFileSync(filename, data, { createNew: true });
    }, Oden.errors.AlreadyExists);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncAppend() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    Oden.writeFileSync(filename, data);
    Oden.writeFileSync(filename, data, { append: true });
    let dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    let actual = dec.decode(dataRead);
    assertEquals(actual, "HelloHello");
    // Now attempt overwrite
    Oden.writeFileSync(filename, data, { append: false });
    dataRead = Oden.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
    // append not set should also overwrite
    Oden.writeFileSync(filename, data);
    dataRead = Oden.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, data);
    const dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = await Oden.makeTempDir();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    await Oden.writeFile(fileUrl, data);
    const dataRead = Oden.readFileSync(fileUrl);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileNotFound() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = "/baddir/test.txt";
    // The following should fail because /baddir doesn't exist (hopefully).
    await assertRejects(async () => {
      await Oden.writeFile(filename, data);
    }, Oden.errors.NotFound);
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  async function writeFilePerm() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = "/baddir/test.txt";
    // The following should fail due to no write permission
    await assertRejects(async () => {
      await Oden.writeFile(filename, data);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileUpdateMode() {
    if (Oden.build.os !== "windows") {
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Oden.makeTempDirSync() + "/test.txt";
      await Oden.writeFile(filename, data, { mode: 0o755 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o755);
      await Oden.writeFile(filename, data, { mode: 0o666 });
      assertEquals(Oden.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileCreate() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    // if create turned off, the file won't be created
    await assertRejects(async () => {
      await Oden.writeFile(filename, data, { create: false });
    }, Oden.errors.NotFound);

    // Turn on create, should have no error
    await Oden.writeFile(filename, data, { create: true });
    await Oden.writeFile(filename, data, { create: false });
    const dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileCreateNew() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, data, { createNew: true });
    await assertRejects(async () => {
      await Oden.writeFile(filename, data, { createNew: true });
    }, Oden.errors.AlreadyExists);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAppend() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, data);
    await Oden.writeFile(filename, data, { append: true });
    let dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    let actual = dec.decode(dataRead);
    assertEquals(actual, "HelloHello");
    // Now attempt overwrite
    await Oden.writeFile(filename, data, { append: false });
    dataRead = Oden.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
    // append not set should also overwrite
    await Oden.writeFile(filename, data);
    dataRead = Oden.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignal(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    queueMicrotask(() => ac.abort());
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.name, "AbortError");
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalReason(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    const abortReason = new Error();
    queueMicrotask(() => ac.abort(abortReason));
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, abortReason);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPrimitiveReason(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    queueMicrotask(() => ac.abort("Some string"));
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPreAborted(): Promise<void> {
    const ac = new AbortController();
    ac.abort();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.name, "AbortError");
    }
    assertNotExists(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalReasonPreAborted(): Promise<void> {
    const ac = new AbortController();
    const abortReason = new Error();
    ac.abort(abortReason);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, abortReason);
    }
    assertNotExists(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPrimitiveReasonPreAborted(): Promise<
    void
  > {
    const ac = new AbortController();
    ac.abort("Some string");
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    try {
      await Oden.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
    assertNotExists(filename);
  },
);

// Test that AbortController's cancel handle is cleaned-up correctly, and do not leak resources.
Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileWithAbortSignalNotCalled() {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, data, { signal: ac.signal });
    const dataRead = Oden.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

function assertNotExists(filename: string | URL) {
  if (pathExists(filename)) {
    throw new Error(`The file ${filename} exists.`);
  }
}

function pathExists(path: string | URL) {
  try {
    Oden.statSync(path);
    return true;
  } catch {
    return false;
  }
}

Oden.test(
  { permissions: { read: true, write: true } },
  async function writeFileStream() {
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array([1]));
        controller.enqueue(new Uint8Array([2]));
        controller.close();
      },
    });
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, stream);
    assertEquals(Oden.readFileSync(filename), new Uint8Array([1, 2]));
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function overwriteFileWithStream() {
    const filename = Oden.makeTempDirSync() + "/test.txt";
    await Oden.writeFile(filename, new Uint8Array([1, 2, 3, 4]));

    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array([1]));
        controller.enqueue(new Uint8Array([2]));
        controller.close();
      },
    });
    await Oden.writeFile(filename, stream);
    assertEquals(Oden.readFileSync(filename), new Uint8Array([1, 2]));
  },
);
