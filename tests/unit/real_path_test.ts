// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertMatch,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Oden.test({ permissions: { read: true } }, function realPathSyncSuccess() {
  const relative = "tests/testdata/assets/fixture.json";
  const realPath = Oden.realPathSync(relative);
  if (Oden.build.os !== "windows") {
    assert(realPath.startsWith("/"));
    assert(realPath.endsWith(relative));
  } else {
    assertMatch(realPath, /^[A-Z]:\\/);
    assert(realPath.endsWith(relative.replace(/\//g, "\\")));
  }
});

Oden.test({ permissions: { read: true } }, function realPathSyncUrl() {
  const relative = "tests/testdata/assets/fixture.json";
  const url = pathToAbsoluteFileUrl(relative);
  assertEquals(Oden.realPathSync(relative), Oden.realPathSync(url));
});

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  function realPathSyncSymlink() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir + "/target";
    const symlink = testDir + "/symln";
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const realPath = Oden.realPathSync(symlink);
    if (Oden.build.os !== "windows") {
      assert(realPath.startsWith("/"));
      assert(realPath.endsWith("/target"));
    } else {
      assertMatch(realPath, /^[A-Z]:\\/);
      assert(realPath.endsWith("\\target"));
    }
  },
);

Oden.test({ permissions: { read: false } }, function realPathSyncPerm() {
  assertThrows(() => {
    Oden.realPathSync("some_file");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, function realPathSyncNotFound() {
  assertThrows(() => {
    Oden.realPathSync("bad_filename");
  }, Oden.errors.NotFound);
});

Oden.test({ permissions: { read: true } }, async function realPathSuccess() {
  const relativePath = "tests/testdata/assets/fixture.json";
  const realPath = await Oden.realPath(relativePath);
  if (Oden.build.os !== "windows") {
    assert(realPath.startsWith("/"));
    assert(realPath.endsWith(relativePath));
  } else {
    assertMatch(realPath, /^[A-Z]:\\/);
    assert(realPath.endsWith(relativePath.replace(/\//g, "\\")));
  }
});

Oden.test(
  { permissions: { read: true } },
  async function realPathUrl() {
    const relative = "tests/testdata/assets/fixture.json";
    const url = pathToAbsoluteFileUrl(relative);
    assertEquals(await Oden.realPath(relative), await Oden.realPath(url));
  },
);

Oden.test(
  {
    permissions: { read: true, write: true },
  },
  async function realPathSymlink() {
    const testDir = Oden.makeTempDirSync();
    const target = testDir + "/target";
    const symlink = testDir + "/symln";
    Oden.mkdirSync(target);
    Oden.symlinkSync(target, symlink);
    const realPath = await Oden.realPath(symlink);
    if (Oden.build.os !== "windows") {
      assert(realPath.startsWith("/"));
      assert(realPath.endsWith("/target"));
    } else {
      assertMatch(realPath, /^[A-Z]:\\/);
      assert(realPath.endsWith("\\target"));
    }
  },
);

Oden.test({ permissions: { read: false } }, async function realPathPerm() {
  await assertRejects(async () => {
    await Oden.realPath("some_file");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { read: true } }, async function realPathNotFound() {
  await assertRejects(async () => {
    await Oden.realPath("bad_filename");
  }, Oden.errors.NotFound);
});
