// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";
import { join } from "@std/path";

Oden.test(
  { permissions: { read: true, write: true } },
  function linkSyncSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldData = "Hardlink";
    const oldName = testDir + "/oldname";
    const newName = testDir + "/newname";
    Oden.writeFileSync(oldName, new TextEncoder().encode(oldData));
    // Create the hard link.
    Oden.linkSync(oldName, newName);
    // We should expect reading the same content.
    const newData = Oden.readTextFileSync(newName);
    assertEquals(oldData, newData);
    // Writing to newname also affects oldname.
    const newData2 = "Modified";
    Oden.writeFileSync(newName, new TextEncoder().encode(newData2));
    assertEquals(
      newData2,
      Oden.readTextFileSync(oldName),
    );
    // Writing to oldname also affects newname.
    const newData3 = "ModifiedAgain";
    Oden.writeFileSync(oldName, new TextEncoder().encode(newData3));
    assertEquals(
      newData3,
      Oden.readTextFileSync(newName),
    );
    // Remove oldname. File still accessible through newname.
    Oden.removeSync(oldName);
    const newNameStat = Oden.statSync(newName);
    assert(newNameStat.isFile);
    assert(!newNameStat.isSymlink); // Not a symlink.
    assertEquals(
      newData3,
      Oden.readTextFileSync(newName),
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function linkSyncExists() {
    const testDir = Oden.makeTempDirSync();
    const oldName = join(testDir, "oldname");
    const newName = join(testDir, "newname");
    Oden.writeFileSync(oldName, new TextEncoder().encode("oldName"));
    // newname is already created.
    Oden.writeFileSync(newName, new TextEncoder().encode("newName"));

    assertThrows(
      () => {
        Oden.linkSync(oldName, newName);
      },
      Oden.errors.AlreadyExists,
      `link '${oldName}' -> '${newName}'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function linkSyncNotFound() {
    const testDir = Oden.makeTempDirSync();
    const oldName = join(testDir, "oldname");
    const newName = join(testDir, "newname");

    assertThrows(
      () => {
        Oden.linkSync(oldName, newName);
      },
      Oden.errors.NotFound,
      `link '${oldName}' -> '${newName}'`,
    );
  },
);

Oden.test(
  { permissions: { read: false, write: true } },
  function linkSyncReadPerm() {
    assertThrows(() => {
      Oden.linkSync("oldbaddir", "newbaddir");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  function linkSyncWritePerm() {
    assertThrows(() => {
      Oden.linkSync("oldbaddir", "newbaddir");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function linkSuccess() {
    const testDir = Oden.makeTempDirSync();
    const oldData = "Hardlink";
    const oldName = testDir + "/oldname";
    const newName = testDir + "/newname";
    Oden.writeFileSync(oldName, new TextEncoder().encode(oldData));
    // Create the hard link.
    await Oden.link(oldName, newName);
    // We should expect reading the same content.
    const newData = Oden.readTextFileSync(newName);
    assertEquals(oldData, newData);
    // Writing to newname also affects oldname.
    const newData2 = "Modified";
    Oden.writeFileSync(newName, new TextEncoder().encode(newData2));
    assertEquals(
      newData2,
      Oden.readTextFileSync(oldName),
    );
    // Writing to oldname also affects newname.
    const newData3 = "ModifiedAgain";
    Oden.writeFileSync(oldName, new TextEncoder().encode(newData3));
    assertEquals(
      newData3,
      Oden.readTextFileSync(newName),
    );
    // Remove oldname. File still accessible through newname.
    Oden.removeSync(oldName);
    const newNameStat = Oden.statSync(newName);
    assert(newNameStat.isFile);
    assert(!newNameStat.isSymlink); // Not a symlink.
    assertEquals(
      newData3,
      Oden.readTextFileSync(newName),
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function linkExists() {
    const testDir = Oden.makeTempDirSync();
    const oldName = join(testDir, "oldname");
    const newName = join(testDir, "newname");
    Oden.writeFileSync(oldName, new TextEncoder().encode("oldName"));
    // newname is already created.
    Oden.writeFileSync(newName, new TextEncoder().encode("newName"));

    await assertRejects(
      async () => {
        await Oden.link(oldName, newName);
      },
      Oden.errors.AlreadyExists,
      `link '${oldName}' -> '${newName}'`,
    );
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  async function linkNotFound() {
    const testDir = Oden.makeTempDirSync();
    const oldName = join(testDir, "oldname");
    const newName = join(testDir, "newname");

    await assertRejects(
      async () => {
        await Oden.link(oldName, newName);
      },
      Oden.errors.NotFound,
      `link '${oldName}' -> '${newName}'`,
    );
  },
);

Oden.test(
  { permissions: { read: false, write: true } },
  async function linkReadPerm() {
    await assertRejects(async () => {
      await Oden.link("oldbaddir", "newbaddir");
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { read: true, write: false } },
  async function linkWritePerm() {
    await assertRejects(async () => {
      await Oden.link("oldbaddir", "newbaddir");
    }, Oden.errors.NotCapable);
  },
);
