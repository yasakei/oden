// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertEquals, assertThrows } from "./test_util.ts";

Oden.test({ permissions: { read: true } }, function dirCwdNotNull() {
  assert(Oden.cwd() != null);
});

Oden.test(
  { permissions: { read: true, write: true } },
  function dirCwdChdirSuccess() {
    const initialdir = Oden.cwd();
    const path = Oden.makeTempDirSync();
    Oden.chdir(path);
    const current = Oden.cwd();
    if (Oden.build.os === "darwin") {
      assertEquals(current, "/private" + path);
    } else {
      assertEquals(current, path);
    }
    Oden.chdir(initialdir);
  },
);

Oden.test({ permissions: { read: true, write: true } }, function dirCwdError() {
  // excluding windows since it throws resource busy, while removeSync
  if (["linux", "darwin"].includes(Oden.build.os)) {
    const initialdir = Oden.cwd();
    const path = Oden.makeTempDirSync();
    Oden.chdir(path);
    Oden.removeSync(path);
    try {
      assertThrows(() => {
        Oden.cwd();
      }, Oden.errors.NotFound);
    } finally {
      Oden.chdir(initialdir);
    }
  }
});

Oden.test(
  { permissions: { read: true, write: true } },
  function dirChdirError() {
    const path = Oden.makeTempDirSync() + "test";
    assertThrows(
      () => {
        Oden.chdir(path);
      },
      Oden.errors.NotFound,
      `chdir '${path}'`,
    );
  },
);
