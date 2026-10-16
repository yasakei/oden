// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertThrows, fail } from "@std/assert";
import { truncate, truncateSync } from "node:fs";

Oden.test({
  name: "ASYNC: no callback function results in Error",
  fn() {
    assertThrows(
      () => {
        // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'NoParamCallback'
        truncate("some/path", 0);
      },
      Error,
      "No callback function supplied",
    );
  },
});

Oden.test({
  name: "ASYNC: truncate entire file contents",
  async fn() {
    const file: string = Oden.makeTempFileSync();
    await Oden.writeTextFile(file, "hello world");

    await new Promise<void>((resolve, reject) => {
      truncate(file, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const fileInfo: Oden.FileInfo = Oden.lstatSync(file);
          assertEquals(fileInfo.size, 0);
        },
        () => {
          fail("No error expected");
        },
      )
      .finally(() => Oden.removeSync(file));
  },
});

Oden.test({
  name: "ASYNC: truncate file to a size of precisely len bytes",
  async fn() {
    const file: string = Oden.makeTempFileSync();
    await Oden.writeTextFile(file, "hello world");

    await new Promise<void>((resolve, reject) => {
      truncate(file, 3, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const fileInfo: Oden.FileInfo = Oden.lstatSync(file);
          assertEquals(fileInfo.size, 3);
        },
        () => {
          fail("No error expected");
        },
      )
      .finally(() => Oden.removeSync(file));
  },
});

Oden.test({
  name: "SYNC: truncate entire file contents",
  fn() {
    const file: string = Oden.makeTempFileSync();
    try {
      truncateSync(file);
      const fileInfo: Oden.FileInfo = Oden.lstatSync(file);
      assertEquals(fileInfo.size, 0);
    } finally {
      Oden.removeSync(file);
    }
  },
});

Oden.test({
  name: "SYNC: truncate file to a size of precisely len bytes",
  fn() {
    const file: string = Oden.makeTempFileSync();
    try {
      truncateSync(file, 3);
      const fileInfo: Oden.FileInfo = Oden.lstatSync(file);
      assertEquals(fileInfo.size, 3);
    } finally {
      Oden.removeSync(file);
    }
  },
});
