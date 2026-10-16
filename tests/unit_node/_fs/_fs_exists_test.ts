// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { exists, existsSync } from "node:fs";
import { promisify } from "node:util";
import { join } from "@std/path";
import { symlink } from "node:fs/promises";

Oden.test("[std/node/fs] exists", async function () {
  const availableFile = await new Promise((resolve) => {
    const tmpFilePath = Oden.makeTempFileSync();
    exists(tmpFilePath, (exists: boolean) => {
      Oden.removeSync(tmpFilePath);
      resolve(exists);
    });
  });
  const notAvailableFile = await new Promise((resolve) => {
    exists("./notAvailable.txt", (exists: boolean) => resolve(exists));
  });
  assertEquals(availableFile, true);
  assertEquals(notAvailableFile, false);
});

Oden.test("[std/node/fs] existsSync", function () {
  const tmpFilePath = Oden.makeTempFileSync();
  assertEquals(existsSync(tmpFilePath), true);
  Oden.removeSync(tmpFilePath);
  assertEquals(existsSync("./notAvailable.txt"), false);
});

Oden.test("[std/node/fs] promisify(exists)", async () => {
  const tmpFilePath = await Oden.makeTempFile();
  try {
    const existsPromisified = promisify(exists);
    assert(await existsPromisified(tmpFilePath));
    assert(!await existsPromisified("./notAvailable.txt"));
  } finally {
    await Oden.remove(tmpFilePath);
  }
});

Oden.test("[std/node/fs] exists callback isn't called twice if error is thrown", async () => {
  // This doesn't use `assertCallbackErrorUncaught()` because `exists()` doesn't return a standard node callback, which is what it expects.
  const tempFile = await Oden.makeTempFile();
  const importUrl = new URL("node:fs", import.meta.url);
  const command = new Oden.Command(Oden.execPath(), {
    args: [
      "eval",
      "--no-check",
      `
      import { exists } from ${JSON.stringify(importUrl)};

      exists(${JSON.stringify(tempFile)}, (exists) => {
        // If the bug is present and the callback is called again with false (meaning an error occurred),
        // don't throw another error, so if the subprocess fails we know it had the correct behaviour.
        if (exists) throw new Error("success");
      });`,
    ],
  });
  const { success, stderr } = await command.output();
  await Oden.remove(tempFile);
  assert(!success);
  assertStringIncludes(new TextDecoder().decode(stderr), "Error: success");
});

Oden.test("[std/node/fs] exists should return false on invalid symlink", async () => {
  const tmpDir = await Oden.makeTempDir();
  const symlinkTarget = join(tmpDir, "noop.link");
  const symlinkPath = join(tmpDir, "link");
  try {
    await symlink(symlinkTarget, symlinkPath);
    const isExists = await promisify(exists)(symlinkPath);
    assert(!isExists);
  } finally {
    await Oden.remove(tmpDir, { recursive: true });
  }
});

Oden.test("[std/node/fs] existsSync should return false on invalid symlink", async () => {
  const tmpDir = await Oden.makeTempDir();
  const symlinkTarget = join(tmpDir, "noop.link");
  const symlinkPath = join(tmpDir, "link");
  try {
    await symlink(symlinkTarget, symlinkPath);
    assert(!existsSync(symlinkPath));
  } finally {
    await Oden.remove(tmpDir, { recursive: true });
  }
});
