// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertThrows, fail } from "@std/assert";
import { utimes, utimesSync } from "node:fs";

const randomDate = new Date(Date.now() + 1000);

Oden.test({
  name:
    "ASYNC: change the file system timestamps of the object referenced by path",
  async fn() {
    const file: string = Oden.makeTempFileSync();

    await new Promise<void>((resolve, reject) => {
      utimes(file, randomDate, randomDate, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const fileInfo: Oden.FileInfo = Oden.lstatSync(file);
          assertEquals(fileInfo.mtime, randomDate);
          assertEquals(fileInfo.mtime, randomDate);
        },
        () => {
          fail("No error expected");
        },
      )
      .finally(() => Oden.removeSync(file));
  },
});

Oden.test({
  name: "ASYNC: should throw error if atime is infinity",
  fn() {
    assertThrows(
      () => {
        utimes("some/path", Infinity, 0, (_err: Error | null) => {});
      },
      Error,
      "invalid atime, must not be infinity or NaN",
    );
  },
});

Oden.test({
  name: "ASYNC: should throw error if atime is NaN",
  fn() {
    assertThrows(
      () => {
        utimes("some/path", "some string", 0, (_err: Error | null) => {});
      },
      Error,
      "invalid atime, must not be infinity or NaN",
    );
  },
});

Oden.test({
  name:
    "SYNC: change the file system timestamps of the object referenced by path",
  fn() {
    const file: string = Oden.makeTempFileSync();
    try {
      utimesSync(file, randomDate, randomDate);

      const fileInfo: Oden.FileInfo = Oden.lstatSync(file);

      assertEquals(fileInfo.mtime, randomDate);
    } finally {
      Oden.removeSync(file);
    }
  },
});

Oden.test({
  name: "SYNC: should throw error if atime is NaN",
  fn() {
    assertThrows(
      () => {
        utimesSync("some/path", "some string", 0);
      },
      Error,
      "invalid atime, must not be infinity or NaN",
    );
  },
});

Oden.test({
  name: "SYNC: should throw error if atime is Infinity",
  fn() {
    assertThrows(
      () => {
        utimesSync("some/path", Infinity, 0);
      },
      Error,
      "invalid atime, must not be infinity or NaN",
    );
  },
});
