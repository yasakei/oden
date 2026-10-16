// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";
import { copy } from "@std/io/copy";

// Note tests for Oden.FsFile.setRaw is in integration tests.

function changingCreateOptions(): Oden.OpenOptions {
  let writeReads = 0;
  return {
    read: false,
    create: true,
    get write() {
      // Validation reads this getter twice before the op converts the options.
      writeReads++;
      return writeReads <= 2;
    },
  };
}

Oden.test(
  { permissions: { read: true, write: false } },
  function openSyncChangingOptionsChecksConvertedAccess() {
    const path = `open_sync_changing_options_${crypto.randomUUID()}`;

    assertThrows(
      () => Oden.openSync(path, changingCreateOptions()),
      Oden.errors.NotCapable,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  async function openChangingOptionsChecksConvertedAccess() {
    const path = `open_changing_options_${crypto.randomUUID()}`;

    await assertRejects(
      () => Oden.open(path, changingCreateOptions()),
      Oden.errors.NotCapable,
    );
  },
);

Oden.test(function filesStdioFileDescriptors() {
  // @ts-ignore `Oden.stdin.rid` was soft-removed in Oden 2.
  assertEquals(Oden.stdin.rid, 0);
  // @ts-ignore `Oden.stdout.rid` was soft-removed in Oden 2.
  assertEquals(Oden.stdout.rid, 1);
  // @ts-ignore `Oden.stderr.rid` was soft-removed in Oden 2.
  assertEquals(Oden.stderr.rid, 2);
});

Oden.test(function fsFileGlobalSymbolCannotConstruct() {
  const FsFileCtor = Oden.FsFile as unknown as new (
    rid: number,
    token: symbol,
  ) => Oden.FsFile;

  assertThrows(
    () => new FsFileCtor(0, Symbol.for("Oden.internal.FsFile")),
    TypeError,
    "'Oden.FsFile' cannot be constructed",
  );
});

Oden.test(
  { permissions: { read: true } },
  async function filesCopyToStdout() {
    const filename = "tests/testdata/assets/fixture.json";
    using file = await Oden.open(filename);
    assert(file instanceof Oden.FsFile);
    const bytesWritten = await copy(file, Oden.stdout);
    const fileSize = Oden.statSync(filename).size;
    assertEquals(bytesWritten, fileSize);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  function openSyncMode() {
    const path = Oden.makeTempDirSync() + "/test_openSync.txt";
    using _file = Oden.openSync(path, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Oden.umask());
    }
  },
);

Oden.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  async function openMode() {
    const path = (await Oden.makeTempDir()) + "/test_open.txt";
    using _file = await Oden.open(path, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Oden.statSync(path);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Oden.umask());
    }
  },
);

Oden.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  function openSyncUrl() {
    const tempDir = Oden.makeTempDirSync();
    const fileUrl = new URL(
      `file://${
        Oden.build.os === "windows" ? "/" : ""
      }${tempDir}/test_open.txt`,
    );
    using _file = Oden.openSync(fileUrl, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Oden.statSync(fileUrl);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Oden.umask());
    }

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  async function openUrl() {
    const tempDir = await Oden.makeTempDir();
    const fileUrl = new URL(
      `file://${
        Oden.build.os === "windows" ? "/" : ""
      }${tempDir}/test_open.txt`,
    );
    using _file = await Oden.open(fileUrl, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Oden.statSync(fileUrl);
    if (Oden.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Oden.umask());
    }

    Oden.removeSync(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: false } },
  async function writePermFailure() {
    const filename = "tests/hello.txt";
    const openOptions: Oden.OpenOptions[] = [{ write: true }, { append: true }];
    for (const options of openOptions) {
      await assertRejects(async () => {
        await Oden.open(filename, options);
      }, Oden.errors.NotCapable);
    }
  },
);

Oden.test(async function openOptions() {
  const filename = "tests/testdata/assets/fixture.json";
  await assertRejects(
    async () => {
      await Oden.open(filename, { write: false });
    },
    Error,
    "'options' requires at least one option to be true",
  );

  await assertRejects(
    async () => {
      await Oden.open(filename, { truncate: true, write: false });
    },
    Error,
    "'truncate' option requires 'write' to be true",
  );

  await assertRejects(
    async () => {
      await Oden.open(filename, { create: true, write: false });
    },
    Error,
    "'create' or 'createNew' options require 'write' or 'append' to be true",
  );

  await assertRejects(
    async () => {
      await Oden.open(filename, { createNew: true, append: false });
    },
    Error,
    "'create' or 'createNew' options require 'write' or 'append' to be true",
  );
});

Oden.test({ permissions: { read: false } }, async function readPermFailure() {
  await assertRejects(async () => {
    await Oden.open("package.json", { read: true });
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { write: true } },
  async function writeNullBufferFailure() {
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "hello.txt";
    const w = {
      write: true,
      truncate: true,
      create: true,
    };
    using file = await Oden.open(filename, w);

    // writing null should throw an error
    await assertRejects(
      async () => {
        // deno-lint-ignore no-explicit-any
        await file.write(null as any);
      },
    ); // TODO(bartlomieju): Check error kind when dispatch_minimal pipes errors properly
    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function readNullBufferFailure() {
    const tempDir = Oden.makeTempDirSync();
    const filename = tempDir + "hello.txt";
    using file = await Oden.open(filename, {
      read: true,
      write: true,
      truncate: true,
      create: true,
    });

    // reading into an empty buffer should return 0 immediately
    const bytesRead = await file.read(new Uint8Array(0));
    assert(bytesRead === 0);

    // reading file into null buffer should throw an error
    await assertRejects(async () => {
      // deno-lint-ignore no-explicit-any
      await file.read(null as any);
    }, TypeError);
    // TODO(bartlomieju): Check error kind when dispatch_minimal pipes errors properly

    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: false, read: false } },
  async function readWritePermFailure() {
    const filename = "tests/hello.txt";
    await assertRejects(async () => {
      await Oden.open(filename, { read: true });
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function openNotFound() {
    await assertRejects(
      async () => {
        await Oden.open("bad_file_name");
      },
      Oden.errors.NotFound,
      `open 'bad_file_name'`,
    );
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  function openSyncNotFound() {
    assertThrows(
      () => {
        Oden.openSync("bad_file_name");
      },
      Oden.errors.NotFound,
      `open 'bad_file_name'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function createFile() {
    const tempDir = await Oden.makeTempDir();
    const filename = tempDir + "/test.txt";
    const f = await Oden.create(filename);
    let fileInfo = Oden.statSync(filename);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Oden.statSync(filename);
    assert(fileInfo.size === 5);
    f.close();

    // TODO(bartlomieju): test different modes
    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function createFileWithUrl() {
    const tempDir = await Oden.makeTempDir();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    const f = await Oden.create(fileUrl);
    let fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.size === 5);
    f.close();

    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function createSyncFile() {
    const tempDir = await Oden.makeTempDir();
    const filename = tempDir + "/test.txt";
    const f = Oden.createSync(filename);
    let fileInfo = Oden.statSync(filename);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Oden.statSync(filename);
    assert(fileInfo.size === 5);
    f.close();

    // TODO(bartlomieju): test different modes
    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function createSyncFileWithUrl() {
    const tempDir = await Oden.makeTempDir();
    const fileUrl = new URL(
      `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    const f = Oden.createSync(fileUrl);
    let fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Oden.statSync(fileUrl);
    assert(fileInfo.size === 5);
    f.close();

    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function openModeWrite() {
    const tempDir = Oden.makeTempDirSync();
    const encoder = new TextEncoder();
    const filename = tempDir + "hello.txt";
    const data = encoder.encode("Hello world!\n");
    let file = await Oden.open(filename, {
      create: true,
      write: true,
      truncate: true,
    });
    // assert file was created
    let fileInfo = Oden.statSync(filename);
    assert(fileInfo.isFile);
    assertEquals(fileInfo.size, 0);
    // write some data
    await file.write(data);
    fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.size, 13);
    // assert we can't read from file
    let thrown = false;
    try {
      const buf = new Uint8Array(20);
      await file.read(buf);
    } catch (_e) {
      thrown = true;
    } finally {
      assert(thrown, "'w' mode shouldn't allow to read file");
    }
    file.close();
    // assert that existing file is truncated on open
    file = await Oden.open(filename, {
      write: true,
      truncate: true,
    });
    file.close();
    const fileSize = Oden.statSync(filename).size;
    assertEquals(fileSize, 0);
    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function openModeWriteRead() {
    const tempDir = Oden.makeTempDirSync();
    const encoder = new TextEncoder();
    const filename = tempDir + "hello.txt";
    const data = encoder.encode("Hello world!\n");

    using file = await Oden.open(filename, {
      write: true,
      truncate: true,
      create: true,
      read: true,
    });
    const seekPosition = 0;
    // assert file was created
    let fileInfo = Oden.statSync(filename);
    assert(fileInfo.isFile);
    assertEquals(fileInfo.size, 0);
    // write some data
    await file.write(data);
    fileInfo = Oden.statSync(filename);
    assertEquals(fileInfo.size, 13);

    const buf = new Uint8Array(20);
    // seeking from beginning of a file
    const cursorPosition = await file.seek(seekPosition, Oden.SeekMode.Start);
    assertEquals(seekPosition, cursorPosition);
    const result = await file.read(buf);
    assertEquals(result, 13);

    await Oden.remove(tempDir, { recursive: true });
  },
);

Oden.test({ permissions: { read: true } }, async function seekStart() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Oden.open(filename);
  const seekPosition = 6;
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = await file.seek(seekPosition, Oden.SeekMode.Start);
  assertEquals(seekPosition, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, async function seekStartBigInt() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Oden.open(filename);
  const seekPosition = 6n;
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = await file.seek(seekPosition, Oden.SeekMode.Start);
  assertEquals(seekPosition, BigInt(cursorPosition));
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, function seekSyncStart() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Oden.openSync(filename);
  const seekPosition = 6;
  // Deliberately move 1 step forward
  file.readSync(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = file.seekSync(seekPosition, Oden.SeekMode.Start);
  assertEquals(seekPosition, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, async function seekCurrent() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Oden.open(filename);
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "ello "
  const seekPosition = 5;
  // seekPosition is relative to current cursor position after read
  const cursorPosition = await file.seek(seekPosition, Oden.SeekMode.Current);
  assertEquals(seekPosition + 1, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, function seekSyncCurrent() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Oden.openSync(filename);
  // Deliberately move 1 step forward
  file.readSync(new Uint8Array(1)); // "H"
  // Skipping "ello "
  const seekPosition = 5;
  // seekPosition is relative to current cursor position after read
  const cursorPosition = file.seekSync(seekPosition, Oden.SeekMode.Current);
  assertEquals(seekPosition + 1, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, async function seekEnd() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Oden.open(filename);
  const seekPosition = -6;
  // seek from end of file that has 12 chars, 12 - 6  = 6
  const cursorPosition = await file.seek(seekPosition, Oden.SeekMode.End);
  assertEquals(6, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, function seekSyncEnd() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Oden.openSync(filename);
  const seekPosition = -6;
  // seek from end of file that has 12 chars, 12 - 6  = 6
  const cursorPosition = file.seekSync(seekPosition, Oden.SeekMode.End);
  assertEquals(6, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Oden.test({ permissions: { read: true } }, async function seekMode() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Oden.open(filename);
  await assertRejects(
    async () => {
      await file.seek(1, -1 as unknown as Oden.SeekMode);
    },
    TypeError,
    "Invalid seek mode",
  );

  // We should still be able to read the file
  // since it is still open.
  const buf = new Uint8Array(1);
  await file.read(buf); // "H"
  assertEquals(new TextDecoder().decode(buf), "H");
});

Oden.test(
  { permissions: { read: true, write: true } },
  function fileTruncateSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_fileTruncateSync.txt";
    using file = Oden.openSync(filename, {
      create: true,
      read: true,
      write: true,
    });

    file.truncateSync(20);
    assertEquals(Oden.readFileSync(filename).byteLength, 20);
    file.truncateSync(5);
    assertEquals(Oden.readFileSync(filename).byteLength, 5);
    file.truncateSync(-5);
    assertEquals(Oden.readFileSync(filename).byteLength, 0);

    Oden.removeSync(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function fileTruncateSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_fileTruncate.txt";
    using file = await Oden.open(filename, {
      create: true,
      read: true,
      write: true,
    });

    await file.truncate(20);
    assertEquals((await Oden.readFile(filename)).byteLength, 20);
    await file.truncate(5);
    assertEquals((await Oden.readFile(filename)).byteLength, 5);
    await file.truncate(-5);
    assertEquals((await Oden.readFile(filename)).byteLength, 0);

    await Oden.remove(filename);
  },
);

Oden.test({ permissions: { read: true } }, function fileStatSyncSuccess() {
  using file = Oden.openSync("README.md");
  const fileInfo = file.statSync();
  assert(fileInfo.isFile);
  assert(!fileInfo.isSymlink);
  assert(!fileInfo.isDirectory);
  assert(fileInfo.size);
  assert(fileInfo.atime);
  assert(fileInfo.mtime);
  // The `birthtime` field is not available on Linux before kernel version 4.11.
  assert(fileInfo.birthtime || Oden.build.os === "linux");
});

Oden.test(async function fileStatSuccess() {
  using file = await Oden.open("README.md");
  const fileInfo = await file.stat();
  assert(fileInfo.isFile);
  assert(!fileInfo.isSymlink);
  assert(!fileInfo.isDirectory);
  assert(fileInfo.size);
  assert(fileInfo.atime);
  assert(fileInfo.mtime);
  // The `birthtime` field is not available on Linux before kernel version 4.11.
  assert(fileInfo.birthtime || Oden.build.os === "linux");
});

Oden.test({ permissions: { read: true } }, async function readableStream() {
  const filename = "tests/testdata/assets/hello.txt";
  const file = await Oden.open(filename);
  assert(file.readable instanceof ReadableStream);
  const chunks = [];
  for await (const chunk of file.readable) {
    chunks.push(chunk);
  }
  assertEquals(chunks.length, 1);
  assertEquals(chunks[0].byteLength, 12);
});

Oden.test(
  {
    permissions: { read: true },
    sanitizeOps: true,
    sanitizeResources: true,
  },
  async function readableStreamTakesOwnership() {
    // Consuming `file.readable` to completion takes ownership of the file and
    // closes it automatically, so the resource and op sanitizers should not
    // report a leak even though `file` is never closed manually.
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Oden.open(filename);
    const chunks = await Array.fromAsync(file.readable);
    assertEquals(chunks.length, 1);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readableStreamClosedResourceErrorMessage() {
    // Regression test for https://github.com/denoland/deno/issues/34958 —
    // closing the file (e.g. via a `using` declaration or an explicit
    // `.close()`) while its `.readable` stream is still being consumed should
    // surface an actionable error rather than a terse "Bad resource ID".
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Oden.open(filename);
    const reader = file.readable.getReader();
    file.close();
    await assertRejects(
      () => reader.read(),
      Error,
      "The stream's underlying resource was closed or consumed",
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writableStreamClosedResourceErrorMessage() {
    // Regression test for https://github.com/denoland/deno/issues/34958 —
    // the writable counterpart of the case above.
    const tempFile = await Oden.makeTempFile();
    try {
      const file = await Oden.open(tempFile, { write: true });
      const writer = file.writable.getWriter();
      file.close();
      // The file's writable stream buffers small writes (64 KiB), so write a
      // chunk large enough to be flushed to the underlying resource directly.
      // The flush errors the stream; the error surfaces on `writer.closed`.
      await assertRejects(
        async () => {
          await writer.write(new Uint8Array(128 * 1024)).catch(() => {});
          await writer.closed;
        },
        Error,
        "The stream's underlying resource was closed or consumed",
      );
    } finally {
      await Oden.remove(tempFile);
    }
  },
);

Oden.test(
  { permissions: { read: true } },
  async function readableStreamTextEncoderPipe() {
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Oden.open(filename);
    const readable = file.readable.pipeThrough(new TextDecoderStream());
    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    assertEquals(chunks.length, 1);
    assertEquals(chunks[0].length, 12);
  },
);

Oden.test(
  {
    permissions: { read: true, write: true, run: true },
    ignore: Oden.build.os === "windows",
  },
  async function readableStreamCancelOnFifo() {
    // Regression test for https://github.com/denoland/deno/issues/21186
    // — a `read` on a FIFO can block indefinitely waiting for data, and
    // previously cancelling the wrapping `ReadableStream` would not
    // unblock the in-flight `op_read`. As a result, the runtime would
    // hang on exit even after JS had finished. We verify the fix by
    // running a subprocess that opens a FIFO, starts a read, cancels
    // it, and is expected to exit promptly. Without the fix the
    // subprocess would hang until killed.
    const tempDir = await Oden.makeTempDir();
    const fifo = `${tempDir}/fifo`;
    try {
      const mkfifo = new Oden.Command("mkfifo", { args: [fifo] }).outputSync();
      if (mkfifo.code !== 0) {
        throw new Error(
          `mkfifo failed: ${new TextDecoder().decode(mkfifo.stderr)}`,
        );
      }
      const script = `
        const fifo = ${JSON.stringify(fifo)};
        // O_RDWR avoids the POSIX FIFO open-blocks-on-peer semantics.
        const file = await Oden.open(fifo, { read: true, write: true });
        const r = file.readable.getReader();
        const reading = r.read();
        await new Promise((res) => setTimeout(res, 50));
        await r.cancel();
        await reading;
      `;
      const out = await new Oden.Command(Oden.execPath(), {
        args: ["eval", script],
        stdout: "null",
        stderr: "piped",
        signal: AbortSignal.timeout(10_000),
      }).output();
      if (out.signal !== null) {
        throw new Error(
          "subprocess hung after stream cancellation — read was not cancelled",
        );
      }
      assertEquals(
        out.code,
        0,
        `subprocess failed: ${new TextDecoder().decode(out.stderr)}`,
      );
    } finally {
      await Oden.remove(tempDir, { recursive: true });
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function writableStream() {
    const path = await Oden.makeTempFile();
    const file = await Oden.open(path, { write: true });
    assert(file.writable instanceof WritableStream);
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("hello "));
        controller.enqueue(new TextEncoder().encode("world!"));
        controller.close();
      },
    });
    await readable.pipeTo(file.writable);
    const res = await Oden.readTextFile(path);
    assertEquals(res, "hello world!");
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function readTextFileNonUtf8() {
    const path = await Oden.makeTempFile();
    using file = await Oden.open(path, { write: true });
    await file.write(new TextEncoder().encode("hello "));
    await file.write(new Uint8Array([0xC0]));

    const res = await Oden.readTextFile(path);
    const resSync = Oden.readTextFileSync(path);
    assertEquals(res, resSync);
    assertEquals(res, "hello \uFFFD");
  },
);

Oden.test(
  { permissions: { read: true } },
  async function fsFileExplicitResourceManagement() {
    let file2: Oden.FsFile;

    {
      using file = await Oden.open("tests/testdata/assets/hello.txt");
      file2 = file;

      const stat = file.statSync();
      assert(stat.isFile);
    }

    assertThrows(() => file2.statSync(), Oden.errors.BadResource);
  },
);

Oden.test(
  { permissions: { read: true } },
  async function fsFileExplicitResourceManagementManualClose() {
    using file = await Oden.open("tests/testdata/assets/hello.txt");
    file.close();
    assertThrows(() => file.statSync(), Oden.errors.BadResource); // definitely closed
    // calling [Symbol.dispose] after manual close is a no-op
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function fsFileDatasyncSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_fdatasyncSync.txt";
    const file = Oden.openSync(filename, {
      read: true,
      write: true,
      create: true,
    });
    const data = new Uint8Array(64);
    file.writeSync(data);
    file.syncDataSync();
    assertEquals(Oden.readFileSync(filename), data);
    file.close();
    Oden.removeSync(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function fsFileDatasyncSuccess() {
    const filename = (await Oden.makeTempDir()) + "/test_fdatasync.txt";
    const file = await Oden.open(filename, {
      read: true,
      write: true,
      create: true,
    });
    const data = new Uint8Array(64);
    await file.write(data);
    await file.syncData();
    assertEquals(await Oden.readFile(filename), data);
    file.close();
    await Oden.remove(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function fsFileSyncSyncSuccess() {
    const filename = Oden.makeTempDirSync() + "/test_fsyncSync.txt";
    const file = Oden.openSync(filename, {
      read: true,
      write: true,
      create: true,
    });
    const size = 64;
    file.truncateSync(size);
    file.syncSync();
    assertEquals(file.statSync().size, size);
    file.close();
    Oden.removeSync(filename);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function fsFileSyncSuccess() {
    const filename = (await Oden.makeTempDir()) + "/test_fsync.txt";
    const file = await Oden.open(filename, {
      read: true,
      write: true,
      create: true,
    });
    const size = 64;
    await file.truncate(size);
    await file.sync();
    assertEquals((await file.stat()).size, size);
    file.close();
    await Oden.remove(filename);
  },
);

Oden.test({ permissions: { read: true } }, function fsFileIsTerminal() {
  // CI not under TTY, so cannot test stdin/stdout/stderr.
  using file = Oden.openSync("tests/testdata/assets/hello.txt");
  assert(!file.isTerminal());
});

Oden.test(
  { permissions: { read: true, run: true } },
  async function fsFileLockFileSync() {
    await runFlockTests({ sync: true });
  },
);

Oden.test(
  { permissions: { read: true, run: true } },
  async function fsFileLockFileAsync() {
    await runFlockTests({ sync: false });
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function fsFileTryLockSync() {
    const path = Oden.makeTempFileSync();
    try {
      using file1 = Oden.openSync(path, { read: true, write: true });
      using file2 = Oden.openSync(path, { read: true, write: true });

      // First lock should succeed
      assertEquals(file1.tryLockSync(true), true);

      // Second exclusive lock should fail (returns false, not block)
      assertEquals(file2.tryLockSync(true), false);

      // Shared lock should also fail when exclusive is held
      assertEquals(file2.tryLockSync(false), false);

      // Unlock first file
      file1.unlockSync();

      // Now second file should be able to lock
      assertEquals(file2.tryLockSync(true), true);
      file2.unlockSync();
    } finally {
      Oden.removeSync(path);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function fsFileTryLockAsync() {
    const path = await Oden.makeTempFile();
    try {
      using file1 = await Oden.open(path, { read: true, write: true });
      using file2 = await Oden.open(path, { read: true, write: true });

      // First lock should succeed
      assertEquals(await file1.tryLock(true), true);

      // Second exclusive lock should fail (returns false, not block)
      assertEquals(await file2.tryLock(true), false);

      // Shared lock should also fail when exclusive is held
      assertEquals(await file2.tryLock(false), false);

      // Unlock first file
      await file1.unlock();

      // Now second file should be able to lock
      assertEquals(await file2.tryLock(true), true);
      await file2.unlock();
    } finally {
      await Oden.remove(path);
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function fsFileTryLockSharedSync() {
    const path = Oden.makeTempFileSync();
    try {
      using file1 = Oden.openSync(path, { read: true, write: true });
      using file2 = Oden.openSync(path, { read: true, write: true });

      // First shared lock should succeed
      assertEquals(file1.tryLockSync(false), true);

      // Second shared lock should also succeed
      assertEquals(file2.tryLockSync(false), true);

      // Exclusive lock should fail when shared locks are held
      using file3 = Oden.openSync(path, { read: true, write: true });
      assertEquals(file3.tryLockSync(true), false);

      file1.unlockSync();
      file2.unlockSync();
    } finally {
      Oden.removeSync(path);
    }
  },
);

async function runFlockTests(opts: { sync: boolean }) {
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: true,
      secondExclusive: false,
      sync: opts.sync,
    }),
    true,
    "exclusive blocks shared",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: false,
      secondExclusive: true,
      sync: opts.sync,
    }),
    true,
    "shared blocks exclusive",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: true,
      secondExclusive: true,
      sync: opts.sync,
    }),
    true,
    "exclusive blocks exclusive",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: false,
      secondExclusive: false,
      sync: opts.sync,
      // need to wait for both to enter the lock to prevent the case where the
      // first process enters and exits the lock before the second even enters
      waitBothEnteredLock: true,
    }),
    false,
    "shared does not block shared",
  );
}

async function checkFirstBlocksSecond(opts: {
  firstExclusive: boolean;
  secondExclusive: boolean;
  sync: boolean;
  waitBothEnteredLock?: boolean;
}) {
  const firstProcess = runFlockTestProcess({
    exclusive: opts.firstExclusive,
    sync: opts.sync,
  });
  const secondProcess = runFlockTestProcess({
    exclusive: opts.secondExclusive,
    sync: opts.sync,
  });
  try {
    const sleep = (time: number) => new Promise((r) => setTimeout(r, time));

    await Promise.all([
      firstProcess.waitStartup(),
      secondProcess.waitStartup(),
    ]);

    await firstProcess.enterLock();
    await firstProcess.waitEnterLock();

    await secondProcess.enterLock();
    await sleep(100);

    if (!opts.waitBothEnteredLock) {
      await firstProcess.exitLock();
    }

    await secondProcess.waitEnterLock();

    if (opts.waitBothEnteredLock) {
      await firstProcess.exitLock();
    }

    await secondProcess.exitLock();

    // collect the final output
    const firstPsTimes = await firstProcess.getTimes();
    const secondPsTimes = await secondProcess.getTimes();
    return firstPsTimes.exitTime < secondPsTimes.enterTime;
  } finally {
    await firstProcess.close();
    await secondProcess.close();
  }
}

function runFlockTestProcess(opts: { exclusive: boolean; sync: boolean }) {
  const path = "tests/testdata/assets/lock_target.txt";
  const scriptText = `
    const file = Oden.openSync("${path}");

    // ready signal
    Oden.stdout.writeSync(new Uint8Array(1));
    // wait for enter lock signal
    Oden.stdin.readSync(new Uint8Array(1));

    // entering signal
    Oden.stdout.writeSync(new Uint8Array(1));
    // lock and record the entry time
    ${
    opts.sync
      ? `file.lockSync(${opts.exclusive ? "true" : "false"});`
      : `await file.lock(${opts.exclusive ? "true" : "false"});`
  }
    const enterTime = new Date().getTime();
    // entered signal
    Oden.stdout.writeSync(new Uint8Array(1));

    // wait for exit lock signal
    Oden.stdin.readSync(new Uint8Array(1));

    // record the exit time and wait a little bit before releasing
    // the lock so that the enter time of the next process doesn't
    // occur at the same time as this exit time
    const exitTime = new Date().getTime();
    await new Promise(resolve => setTimeout(resolve, 100));

    // release the lock
    ${opts.sync ? "file.unlockSync();" : "await file.unlock();"}

    // exited signal
    Oden.stdout.writeSync(new Uint8Array(1));

    // output the enter and exit time
    console.log(JSON.stringify({ enterTime, exitTime }));
`;

  const process = new Oden.Command(Oden.execPath(), {
    args: ["eval", scriptText],
    stdin: "piped",
    stdout: "piped",
    stderr: "null",
  }).spawn();

  const waitSignal = async () => {
    const reader = process.stdout.getReader({ mode: "byob" });
    await reader.read(new Uint8Array(1));
    reader.releaseLock();
  };
  const signal = async () => {
    const writer = process.stdin.getWriter();
    await writer.write(new Uint8Array(1));
    writer.releaseLock();
  };

  return {
    async waitStartup() {
      await waitSignal();
    },
    async enterLock() {
      await signal();
      await waitSignal(); // entering signal
    },
    async waitEnterLock() {
      await waitSignal();
    },
    async exitLock() {
      await signal();
      await waitSignal();
    },
    getTimes: async () => {
      const { stdout } = await process.output();
      const text = new TextDecoder().decode(stdout);
      return JSON.parse(text) as {
        enterTime: number;
        exitTime: number;
      };
    },
    close: async () => {
      await process.status;
      await process.stdin.close();
    },
  };
}
