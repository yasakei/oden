// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

function assertSameContent(files: Oden.DirEntry[]) {
  let counter = 0;

  for (const entry of files) {
    if (entry.name === "subdir") {
      assert(entry.isDirectory);
      counter++;
    }
  }

  assertEquals(counter, 1);
}

Oden.test({ permissions: { read: true } }, function readDirSyncSuccess() {
  const files = [...Oden.readDirSync("tests/testdata")];
  assertSameContent(files);
});

Oden.test(
  { permissions: { read: true } },
  function readDirSyncResultHasIteratorHelperMethods() {
    const iterator = Oden.readDirSync("tests/testdata");
    assertEquals(typeof iterator.map, "function");
  },
);

Oden.test({ permissions: { read: true } }, function readDirSyncWithUrl() {
  const files = [
    ...Oden.readDirSync(pathToAbsoluteFileUrl("tests/testdata")),
  ];
  assertSameContent(files);
});

Oden.test({ permissions: { read: false } }, function readDirSyncPerm() {
  assertThrows(() => {
    Oden.readDirSync("tests/");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function readDirSyncNotDir() {
  assertThrows(
    () => {
      Oden.readDirSync("tests/testdata/assets/fixture.json");
    },
    Error,
    `readdir 'tests/testdata/assets/fixture.json'`,
  );
});

Oden.test({ permissions: { read: true } }, function readDirSyncNotFound() {
  assertThrows(
    () => {
      Oden.readDirSync("bad_dir_name");
    },
    Oden.errors.NotFound,
    `readdir 'bad_dir_name'`,
  );
});

Oden.test({ permissions: { read: true } }, async function readDirSuccess() {
  const files = [];
  for await (const dirEntry of Oden.readDir("tests/testdata")) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

Oden.test({ permissions: { read: true } }, async function readDirWithUrl() {
  const files = [];
  for await (
    const dirEntry of Oden.readDir(pathToAbsoluteFileUrl("tests/testdata"))
  ) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

Oden.test(
  { permissions: { read: true } },
  async function readDirIterableCreatesIndependentIterators() {
    const dir = Oden.readDir("tests/testdata");
    const [filesA, filesB] = await Promise.all([
      Array.fromAsync(dir),
      Array.fromAsync(dir),
    ]);

    assertSameContent(filesA);
    assertSameContent(filesB);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function readDirConcurrentNextRejectsWithBusy() {
    const tempDir = await Oden.makeTempDir();
    try {
      await Promise.all(
        Array.from(
          { length: 64 },
          (_, index) => Oden.writeTextFile(`${tempDir}/${index}.txt`, ""),
        ),
      );
      const iterator = Oden.readDir(tempDir)[Symbol.asyncIterator]();

      await assertRejects(
        async () => {
          await Promise.all(
            Array.from({ length: 64 }, () => iterator.next()),
          );
        },
        Oden.errors.Busy,
      );
      await iterator.return?.();
    } finally {
      await Oden.remove(tempDir, { recursive: true });
    }
  },
);

Oden.test({ permissions: { read: false } }, async function readDirPerm() {
  await assertRejects(async () => {
    await Oden.readDir("tests/")[Symbol.asyncIterator]().next();
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: "inherit", ignore: Oden.build.os == "windows" },
  async function readDirDevFd(): Promise<
    void
  > {
    for await (const _ of Oden.readDir("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular entries
    }
  },
);

Oden.test(
  { permissions: "inherit", ignore: Oden.build.os == "windows" },
  function readDirDevFdSync() {
    for (const _ of Oden.readDirSync("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular file entries
    }
  },
);

Oden.test({ permissions: { read: true } }, async function readDirNotFound() {
  await assertRejects(
    async () => {
      await Oden.readDir("bad_dir_name")[Symbol.asyncIterator]().next();
    },
    Oden.errors.NotFound,
    `readdir 'bad_dir_name'`,
  );
});
