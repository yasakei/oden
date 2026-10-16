// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertRejects, assertThrows } from "./test_util.ts";

// chown on Windows is noop for now, so ignore its testing on Windows

async function getUidAndGid(): Promise<{ uid: number; gid: number }> {
  // get the user ID and group ID of the current process
  const uidProc = await new Oden.Command("id", {
    args: ["-u"],
  }).output();
  const gidProc = await new Oden.Command("id", {
    args: ["-g"],
  }).output();

  assertEquals(uidProc.code, 0);
  assertEquals(gidProc.code, 0);
  const uid = parseInt(new TextDecoder("utf-8").decode(uidProc.stdout));
  const gid = parseInt(new TextDecoder("utf-8").decode(gidProc.stdout));

  return { uid, gid };
}

Oden.test(
  { ignore: Oden.build.os == "windows", permissions: { write: false } },
  async function chownNoWritePermission() {
    const filePath = "chown_test_file.txt";
    await assertRejects(async () => {
      await Oden.chown(filePath, 1000, 1000);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownSyncFileNotExist() {
    const { uid, gid } = await getUidAndGid();
    const filePath = Oden.makeTempDirSync() + "/chown_test_file.txt";

    assertThrows(
      () => {
        Oden.chownSync(filePath, uid, gid);
      },
      Oden.errors.NotFound,
      `chown '${filePath}'`,
    );
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownFileNotExist() {
    const { uid, gid } = await getUidAndGid();
    const filePath = (await Oden.makeTempDir()) + "/chown_test_file.txt";

    await assertRejects(
      async () => {
        await Oden.chown(filePath, uid, gid);
      },
      Oden.errors.NotFound,
      `chown '${filePath}'`,
    );
  },
);

Oden.test(
  { permissions: { write: true }, ignore: Oden.build.os == "windows" },
  function chownSyncPermissionDenied() {
    const dirPath = Oden.makeTempDirSync();
    const filePath = dirPath + "/chown_test_file.txt";
    Oden.writeTextFileSync(filePath, "Hello");

    assertThrows(() => {
      // try changing the file's owner to root
      Oden.chownSync(filePath, 0, 0);
    }, Oden.errors.PermissionDenied);
    Oden.removeSync(dirPath, { recursive: true });
  },
);

Oden.test(
  { permissions: { write: true }, ignore: Oden.build.os == "windows" },
  async function chownPermissionDenied() {
    const dirPath = await Oden.makeTempDir();
    const filePath = dirPath + "/chown_test_file.txt";
    await Oden.writeTextFile(filePath, "Hello");

    await assertRejects(async () => {
      // try changing the file's owner to root
      await Oden.chown(filePath, 0, 0);
    }, Oden.errors.PermissionDenied);
    await Oden.remove(dirPath, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownSyncSucceed() {
    // TODO(bartlomieju): when a file's owner is actually being changed,
    // chown only succeeds if run under privileged user (root)
    // The test script has no such privilege, so need to find a better way to test this case
    const { uid, gid } = await getUidAndGid();

    const dirPath = Oden.makeTempDirSync();
    const filePath = dirPath + "/chown_test_file.txt";
    Oden.writeTextFileSync(filePath, "Hello");

    // the test script creates this file with the same uid and gid,
    // here chown is a noop so it succeeds under non-privileged user
    Oden.chownSync(filePath, uid, gid);

    Oden.removeSync(dirPath, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownSyncWithUrl() {
    const { uid, gid } = await getUidAndGid();
    const dirPath = Oden.makeTempDirSync();
    const fileUrl = new URL(`file://${dirPath}/chown_test_file.txt`);
    Oden.writeTextFileSync(fileUrl, "Hello");
    Oden.chownSync(fileUrl, uid, gid);
    Oden.removeSync(dirPath, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownSucceed() {
    const { uid, gid } = await getUidAndGid();
    const dirPath = await Oden.makeTempDir();
    const filePath = dirPath + "/chown_test_file.txt";
    await Oden.writeTextFile(filePath, "Hello");
    await Oden.chown(filePath, uid, gid);
    Oden.removeSync(dirPath, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownUidOnly() {
    const { uid } = await getUidAndGid();
    const dirPath = await Oden.makeTempDir();
    const filePath = dirPath + "/chown_test_file.txt";
    await Oden.writeTextFile(filePath, "Foo");
    await Oden.chown(filePath, uid, null);
    Oden.removeSync(dirPath, { recursive: true });
  },
);

Oden.test(
  {
    permissions: { run: true, write: true },
    ignore: Oden.build.os == "windows",
  },
  async function chownWithUrl() {
    // TODO(bartlomieju): same as chownSyncSucceed
    const { uid, gid } = await getUidAndGid();

    const enc = new TextEncoder();
    const dirPath = await Oden.makeTempDir();
    const fileUrl = new URL(`file://${dirPath}/chown_test_file.txt`);
    const fileData = enc.encode("Hello");
    await Oden.writeFile(fileUrl, fileData);

    // the test script creates this file with the same uid and gid,
    // here chown is a noop so it succeeds under non-privileged user
    await Oden.chown(fileUrl, uid, gid);

    Oden.removeSync(dirPath, { recursive: true });
  },
);
