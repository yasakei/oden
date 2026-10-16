// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  fail,
} from "@std/assert";
import { existsSync, lstatSync, rm, rmSync, symlinkSync } from "node:fs";
import { rm as rmPromise } from "node:fs/promises";
import { join } from "@std/path";

Oden.test({
  name: "ASYNC: removing empty folder",
  async fn() {
    const dir = Oden.makeTempDirSync();
    await new Promise<void>((resolve, reject) => {
      rm(dir, { recursive: true }, (err) => {
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
  name: "ASYNC: removing non-empty folder",
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
  ignore: Oden.build.os === "windows",
});

Oden.test({
  name: "ASYNC: removing a file",
  async fn() {
    const file = Oden.makeTempFileSync();
    await new Promise<void>((resolve, reject) => {
      rm(file, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    assertEquals(existsSync(file), false);
  },
});

Oden.test({
  name: "ASYNC: remove should fail if target does not exist",
  async fn() {
    const removePromise = new Promise<void>((resolve, reject) => {
      rm("/path/to/noexist.text", (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    await assertRejects(() => removePromise, Error);
  },
});

Oden.test({
  name:
    "ASYNC: remove should not fail if target does not exist and force option is true",
  async fn() {
    await new Promise<void>((resolve, reject) => {
      rm("/path/to/noexist.text", { force: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  },
});

Oden.test({
  name: "SYNC: removing empty folder",
  fn() {
    const dir = Oden.makeTempDirSync();
    rmSync(dir, { recursive: true });
    assertEquals(existsSync(dir), false);
  },
});

Oden.test({
  name: "SYNC: removing non-empty folder",
  fn() {
    const dir = Oden.makeTempDirSync();
    using _file1 = Oden.createSync(join(dir, "file1.txt"));
    using _file2 = Oden.createSync(join(dir, "file2.txt"));
    Oden.mkdirSync(join(dir, "some_dir"));
    using _file = Oden.createSync(join(dir, "some_dir", "file.txt"));
    rmSync(dir, { recursive: true });
    assertEquals(existsSync(dir), false);
  },
  ignore: Oden.build.os === "windows",
});

Oden.test({
  name: "SYNC: removing a file",
  fn() {
    const file = Oden.makeTempFileSync();

    rmSync(file);

    assertEquals(existsSync(file), false);
  },
});

Oden.test({
  name: "SYNC: remove should fail if target does not exist",
  fn() {
    assertThrows(() => rmSync("/path/to/noexist.text"), Error);
  },
});

Oden.test({
  name:
    "SYNC: remove should not fail if target does not exist and force option is true",
  fn() {
    rmSync("/path/to/noexist.text", { force: true });
  },
});

Oden.test({
  name: "SYNC: remove symlinks",
  fn() {
    const baseDir = Oden.makeTempDirSync();
    const dir = `${baseDir}/foo`;
    const link = `${baseDir}/bar`;
    Oden.mkdirSync(dir);
    symlinkSync(dir, link);

    rmSync(link);

    assertEquals(lstatSync(link, { throwIfNoEntry: false }), undefined);
    assert(lstatSync(dir, { throwIfNoEntry: false }));
  },
});

Oden.test({
  name: "ASYNC: remove symlinks",
  async fn() {
    const baseDir = await Oden.makeTempDir();
    const dir = `${baseDir}/foo`;
    const link = `${baseDir}/bar`;
    Oden.mkdirSync(dir);
    symlinkSync(dir, link);

    await rmPromise(link);

    assertEquals(lstatSync(link, { throwIfNoEntry: false }), undefined);
    assert(lstatSync(dir, { throwIfNoEntry: false }));
  },
});
