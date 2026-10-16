// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, fail } from "@std/assert";
import { rm, rmdir, rmdirSync, rmSync } from "node:fs";
import { rmdir as rmdirPromise } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "@std/path";
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import nodeAssert from "node:assert";

Oden.test({
  name: "ASYNC: removing empty folder",
  async fn() {
    const dir = Oden.makeTempDirSync();
    await new Promise<void>((resolve, reject) => {
      rmdir(dir, (err) => {
        if (err) reject(err);
        resolve();
      });
    })
      .then(() => assertEquals(existsSync(dir), false), () => fail())
      .finally(() => {
        if (existsSync(dir)) Oden.removeSync(dir);
      });
  },
});

Oden.test({
  name: "SYNC: removing empty folder",
  fn() {
    const dir = Oden.makeTempDirSync();
    rmdirSync(dir);
    assertEquals(existsSync(dir), false);
  },
});

Oden.test({
  name: "ASYNC: removing non-empty folder via rm({ recursive })",
  async fn() {
    const dir = Oden.makeTempDirSync();
    using _file1 = Oden.createSync(join(dir, "file1.txt"));
    using _file2 = Oden.createSync(join(dir, "file2.txt"));
    Oden.mkdirSync(join(dir, "some_dir"));
    using _file = Oden.createSync(join(dir, "some_dir", "file.txt"));
    await new Promise<void>((resolve, reject) => {
      rm(dir, { recursive: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    })
      .then(() => assertEquals(existsSync(dir), false), () => fail())
      .finally(() => {
        if (existsSync(dir)) Oden.removeSync(dir, { recursive: true });
      });
  },
});

Oden.test({
  name: "SYNC: removing non-empty folder via rmSync({ recursive })",
  fn() {
    const dir = Oden.makeTempDirSync();
    using _file1 = Oden.createSync(join(dir, "file1.txt"));
    using _file2 = Oden.createSync(join(dir, "file2.txt"));
    Oden.mkdirSync(join(dir, "some_dir"));
    using _file = Oden.createSync(join(dir, "some_dir", "file.txt"));
    rmSync(dir, { recursive: true });
    assertEquals(existsSync(dir), false);
  },
});

Oden.test("[std/node/fs] rmdir callback isn't called twice if error is thrown", async () => {
  // The correct behaviour is not to catch any errors thrown,
  // but that means there'll be an uncaught error and the test will fail.
  // So the only way to test this is to spawn a subprocess, and succeed if it has a non-zero exit code.
  // (assertRejects won't work because there's no way to catch the error.)
  const tempDir = await Oden.makeTempDir();
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { rmdir } from ${JSON.stringify(importUrl)}`,
    invocation: `rmdir(${JSON.stringify(tempDir)}, `,
  });
});

Oden.test("SYNC: prevent removing a file", () => {
  const dir = Oden.makeTempDirSync();
  const fileName = "foo.txt";
  const path = join(dir, fileName);
  Oden.writeTextFileSync(path, "Hello, world!");
  nodeAssert.throws(
    () => rmdirSync(path),
    {
      code: "ENOTDIR",
      syscall: "rmdir",
      path,
    },
  );
  Oden.removeSync(dir, { recursive: true });
});

Oden.test("ASYNC: prevent removing a file", async () => {
  const dir = await Oden.makeTempDir();
  const fileName = "foo.txt";
  const path = join(dir, fileName);
  await Oden.writeTextFile(path, "Hello, world!");
  await nodeAssert.rejects(
    async () => await rmdirPromise(path),
    {
      code: "ENOTDIR",
      syscall: "rmdir",
      path,
    },
  );
  await Oden.remove(dir, { recursive: true });
});

Oden.test("SYNC: prevent removing non-empty dir without recursive option", () => {
  const dir = Oden.makeTempDirSync();
  const subDir = join(dir, "subdir");
  Oden.mkdirSync(subDir);
  nodeAssert.throws(
    () => rmdirSync(dir),
    {
      code: "ENOTEMPTY",
      syscall: "rmdir",
      path: dir,
    },
  );
  Oden.removeSync(dir, { recursive: true });
});

Oden.test("ASYNC: prevent removing non-empty dir without recursive option", async () => {
  const dir = await Oden.makeTempDir();
  const subDir = join(dir, "subdir");
  Oden.mkdirSync(subDir);
  await nodeAssert.rejects(
    async () => await rmdirPromise(dir),
    {
      code: "ENOTEMPTY",
      syscall: "rmdir",
      path: dir,
    },
  );
  await Oden.remove(dir, { recursive: true });
});
