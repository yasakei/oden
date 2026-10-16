// Copyright 2018-2026 the Oden authors. MIT license.

// NOTE: This test requires building the extension separately (it is excluded
// from the workspace due to incompatible rusqlite feature requirements):
//   cargo build --manifest-path tests/sqlite_extension/Cargo.toml

import { DatabaseSync } from "node:sqlite";
import { assertEquals, assertThrows } from "@std/assert";
import * as path from "node:path";

const extensionPath = (() => {
  const isWindows = Oden.build.os === "windows";
  const isMac = Oden.build.os === "darwin";
  const isLinux = Oden.build.os === "linux";

  const currentDir = new URL(".", import.meta.url).pathname;
  const odenDir = path.resolve(currentDir, "../..");

  let libPrefix = "";
  let libSuffix = "";

  if (isWindows) {
    libSuffix = "dll";
  } else if (isMac) {
    libPrefix = "lib";
    libSuffix = "dylib";
  } else if (isLinux) {
    libPrefix = "lib";
    libSuffix = "so";
  } else {
    throw new Error("Unsupported platform");
  }

  const targetDir = path.join(odenDir, "target", "debug");
  return path.join(targetDir, `${libPrefix}test_sqlite_extension.${libSuffix}`);
})();

const extensionExists = (() => {
  try {
    Oden.statSync(extensionPath);
    return true;
  } catch {
    return false;
  }
})();

Oden.test({
  name: "[node/sqlite] DatabaseSync loadExtension",
  ignore: !extensionExists,
  permissions: { read: true, write: true, ffi: true },
  fn() {
    const db = new DatabaseSync(":memory:", {
      allowExtension: true,
      readOnly: false,
    });

    db.loadExtension(extensionPath);

    const stmt = db.prepare("SELECT test_func('Hello, World!') AS result");
    const { result } = stmt.get();
    assertEquals(result, "Hello, World!");

    db.close();
  },
});

Oden.test({
  name: "[node/sqlite] DatabaseSync loadExtension with FFI permission denied",
  permissions: { read: true, write: true, ffi: false },
  fn() {
    assertThrows(() => {
      new DatabaseSync(":memory:", {
        allowExtension: true,
        readOnly: false,
      });
    }, Oden.errors.NotCapable);
  },
});

Oden.test({
  name: "[node/sqlite] DatabaseSync loadExtension with invalid path",
  permissions: { read: true, write: true, ffi: true },
  fn() {
    const db = new DatabaseSync(":memory:", {
      allowExtension: true,
      readOnly: false,
    });

    // Loading a non-existent extension should throw
    assertThrows(() => {
      db.loadExtension("/path/to/nonexistent/extension");
    }, Error);

    db.close();
  },
});
