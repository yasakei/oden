// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
  unreachable,
} from "./test_util.ts";

Oden.test({ permissions: { read: true } }, function readFileSyncSuccess() {
  const data = Oden.readFileSync("tests/testdata/assets/fixture.json");
  assert(data.byteLength > 0);
  const decoder = new TextDecoder("utf-8");
  const json = decoder.decode(data);
  const pkg = JSON.parse(json);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: true } }, function readFileSyncUrl() {
  const data = Oden.readFileSync(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.byteLength > 0);
  const decoder = new TextDecoder("utf-8");
  const json = decoder.decode(data);
  const pkg = JSON.parse(json);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: false } }, function readFileSyncPerm() {
  assertThrows(() => {
    Oden.readFileSync("tests/testdata/assets/fixture.json");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readFileSyncNotFound() {
  assertThrows(() => {
    Oden.readFileSync("bad_filename");
  }, Oden.errors.NotFound);
});

Oden.test({ permissions: { read: true } }, async function readFileUrl() {
  const data = await Oden.readFile(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.byteLength > 0);
  const decoder = new TextDecoder("utf-8");
  const json = decoder.decode(data);
  const pkg = JSON.parse(json);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: true } }, async function readFileSuccess() {
  const data = await Oden.readFile("tests/testdata/assets/fixture.json");
  assert(data.byteLength > 0);
  const decoder = new TextDecoder("utf-8");
  const json = decoder.decode(data);
  const pkg = JSON.parse(json);
  assertEquals(pkg.name, "oden");
});

Oden.test({ permissions: { read: false } }, async function readFilePerm() {
  await assertRejects(async () => {
    await Oden.readFile("tests/testdata/assets/fixture.json");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readFileSyncLoop() {
  for (let i = 0; i < 256; i++) {
    Oden.readFileSync("tests/testdata/assets/fixture.json");
  }
});

Oden.test(
  { permissions: { read: true } },
  async function readFileDoesNotLeakResources() {
    await assertRejects(async () => await Oden.readFile("cli"));
  },
);

Oden.test(
  { permissions: { read: true } },
  function readFileSyncDoesNotLeakResources() {
    assertThrows(() => Oden.readFileSync("cli"));
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readFileWithAbortSignal() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort());
    const error = await assertRejects(
      async () => {
        await Oden.readFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assert(error instanceof DOMException);
    assertEquals(error.name, "AbortError");
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readFileWithAbortSignalReason() {
    const ac = new AbortController();
    const abortReason = new Error();
    queueMicrotask(() => ac.abort(abortReason));
    const error = await assertRejects(
      async () => {
        await Oden.readFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assertEquals(error, abortReason);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readFileWithAbortSignalPrimitiveReason() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort("Some string"));
    try {
      await Oden.readFile("tests/testdata/assets/fixture.json", {
        signal: ac.signal,
      });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
  },
);

// Test that AbortController's cancel handle is cleaned-up correctly, and do not leak resources.
Oden.test(
  { permissions: { read: true } },
  async function readFileWithAbortSignalNotCalled() {
    const ac = new AbortController();
    await Oden.readFile("tests/testdata/assets/fixture.json", {
      signal: ac.signal,
    });
  },
);

Oden.test(
  { ignore: Oden.build.os !== "linux" },
  async function readFileProcFs() {
    const data = await Oden.readFile("/proc/self/stat");
    assert(data.byteLength > 0);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readFileNotFoundErrorCode() {
    try {
      await Oden.readFile("definitely-not-found.json");
    } catch (e) {
      assertEquals((e as { code: string }).code, "ENOENT");
    }
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readFileIsDirectoryErrorCode() {
    try {
      await Oden.readFile("tests/testdata/assets/");
    } catch (e) {
      assertEquals((e as { code: string }).code, "EISDIR");
    }
  },
);
