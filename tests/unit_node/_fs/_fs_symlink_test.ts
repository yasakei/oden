// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertThrows, fail } from "@std/assert";
import { symlink, symlinkSync } from "node:fs";

Oden.test({
  name: "ASYNC: no callback function results in Error",
  fn() {
    assertThrows(
      () => {
        // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'NoParamCallback'
        symlink("some/path", "some/other/path", "dir");
      },
      Error,
      "The \"cb\" argument must be of type function. Received type string ('dir')",
    );
  },
});

Oden.test({
  name: "ASYNC: create symlink point to a file",
  async fn() {
    const file: string = Oden.makeTempFileSync();
    const linkedFile: string = file + ".link";

    await new Promise<void>((resolve, reject) => {
      symlink(file, linkedFile, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const stat = Oden.lstatSync(linkedFile);
          assert(stat.isSymlink);
        },
        () => {
          fail("Expected to succeed");
        },
      )
      .finally(() => {
        Oden.removeSync(file);
        Oden.removeSync(linkedFile);
      });
  },
});

Oden.test({
  name: "ASYNC: create symlink point to a dir",
  async fn() {
    const dir: string = Oden.makeTempDirSync();
    const linkedDir: string = dir + ".link";

    await new Promise<void>((resolve, reject) => {
      symlink(dir, linkedDir, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const stat = Oden.lstatSync(linkedDir);
          assert(stat.isSymlink);
        },
        () => {
          fail("Expected to succeed");
        },
      )
      .finally(() => {
        Oden.removeSync(dir);
        Oden.removeSync(linkedDir);
      });
  },
});

Oden.test({
  name: "SYNC: create symlink point to a file",
  fn() {
    const file: string = Oden.makeTempFileSync();
    const linkedFile: string = file + ".link";

    try {
      symlinkSync(file, linkedFile);
      const stat = Oden.lstatSync(linkedFile);
      assert(stat.isSymlink);
    } finally {
      Oden.removeSync(file);
      Oden.removeSync(linkedFile);
    }
  },
});

Oden.test({
  name: "SYNC: create symlink point to a dir",
  fn() {
    const dir: string = Oden.makeTempDirSync();
    const linkedDir: string = dir + ".link";

    try {
      symlinkSync(dir, linkedDir);
      const stat = Oden.lstatSync(linkedDir);
      assert(stat.isSymlink);
    } finally {
      Oden.removeSync(dir);
      Oden.removeSync(linkedDir);
    }
  },
});

Oden.test({
  name: "SYNC: symlink junction",
  fn() {
    const dir: string = Oden.makeTempDirSync();
    const linkedDir: string = dir + "-junction";

    try {
      symlinkSync(dir, linkedDir, "junction");
      const stat = Oden.lstatSync(linkedDir);
      assert(stat.isSymlink);
    } finally {
      Oden.removeSync(dir);
      Oden.removeSync(linkedDir);
    }
  },
});
