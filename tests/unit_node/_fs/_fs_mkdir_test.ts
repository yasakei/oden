// Copyright 2018-2026 the Oden authors. MIT license.
import * as path from "@std/path";
import { assert } from "@std/assert";
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import { existsSync, mkdir, mkdirSync } from "node:fs";

const tmpDir = "./tmpdir";

Oden.test({
  name: "[node/fs] mkdir",
  fn: async () => {
    const result = await new Promise((resolve) => {
      mkdir(tmpDir, (err) => {
        err && resolve(false);
        resolve(existsSync(tmpDir));
        Oden.removeSync(tmpDir);
      });
    });
    assert(result);
  },
});

Oden.test({
  name: "[node/fs] mkdirSync",
  fn: () => {
    mkdirSync(tmpDir);
    assert(existsSync(tmpDir));
    Oden.removeSync(tmpDir);
  },
});

Oden.test({
  name: "[node/fs] mkdir mode",
  fn: () => {
    mkdirSync(tmpDir, { mode: 0o777 });
    assert(existsSync(tmpDir));
    assert(Oden.statSync(tmpDir).mode! & 0o777);

    Oden.removeSync(tmpDir);

    mkdirSync(tmpDir, { mode: "0777" });
    assert(existsSync(tmpDir));
    assert(Oden.statSync(tmpDir).mode! & 0o777);

    Oden.removeSync(tmpDir);
  },
});

Oden.test("[std/node/fs] mkdir callback isn't called twice if error is thrown", async () => {
  const tempDir = await Oden.makeTempDir();
  const subdir = path.join(tempDir, "subdir");
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { mkdir } from ${JSON.stringify(importUrl)}`,
    invocation: `mkdir(${JSON.stringify(subdir)}, `,
    async cleanup() {
      await Oden.remove(tempDir, { recursive: true });
    },
  });
});
