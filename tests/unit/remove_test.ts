// Copyright 2018-2026 the Oden authors. MIT license.
import { assert, assertRejects, assertThrows } from "./test_util.ts";

const REMOVE_METHODS = ["remove", "removeSync"] as const;

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeDirSuccess() {
    for (const method of REMOVE_METHODS) {
      // REMOVE EMPTY DIRECTORY
      const path = Oden.makeTempDirSync() + "/subdir";
      Oden.mkdirSync(path);
      const pathInfo = Oden.statSync(path);
      assert(pathInfo.isDirectory); // check exist first
      await Oden[method](path); // remove
      // We then check again after remove
      assertThrows(() => {
        Oden.statSync(path);
      }, Oden.errors.NotFound);
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeFileSuccess() {
    for (const method of REMOVE_METHODS) {
      // REMOVE FILE
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Oden.makeTempDirSync() + "/test.txt";
      Oden.writeFileSync(filename, data, { mode: 0o666 });
      const fileInfo = Oden.statSync(filename);
      assert(fileInfo.isFile); // check exist first
      await Oden[method](filename); // remove
      // We then check again after remove
      assertThrows(() => {
        Oden.statSync(filename);
      }, Oden.errors.NotFound);
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeFileByUrl() {
    for (const method of REMOVE_METHODS) {
      // REMOVE FILE
      const enc = new TextEncoder();
      const data = enc.encode("Hello");

      const tempDir = Oden.makeTempDirSync();
      const fileUrl = new URL(
        `file://${Oden.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
      );

      Oden.writeFileSync(fileUrl, data, { mode: 0o666 });
      const fileInfo = Oden.statSync(fileUrl);
      assert(fileInfo.isFile); // check exist first
      await Oden[method](fileUrl); // remove
      // We then check again after remove
      assertThrows(() => {
        Oden.statSync(fileUrl);
      }, Oden.errors.NotFound);
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeFail() {
    for (const method of REMOVE_METHODS) {
      // NON-EMPTY DIRECTORY
      const path = Oden.makeTempDirSync() + "/dir/subdir";
      const subPath = path + "/subsubdir";
      Oden.mkdirSync(path, { recursive: true });
      Oden.mkdirSync(subPath);
      const pathInfo = Oden.statSync(path);
      assert(pathInfo.isDirectory); // check exist first
      const subPathInfo = Oden.statSync(subPath);
      assert(subPathInfo.isDirectory); // check exist first

      await assertRejects(
        async () => {
          await Oden[method](path);
        },
        Error,
        `remove '${path}'`,
      );
      // TODO(ry) Is Other really the error we should get here? What would Go do?

      // NON-EXISTENT DIRECTORY/FILE
      await assertRejects(
        async () => {
          await Oden[method]("/baddir");
        },
        Oden.errors.NotFound,
        `remove '/baddir'`,
      );
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeDanglingSymlinkSuccess() {
    for (const method of REMOVE_METHODS) {
      const danglingSymlinkPath = Oden.makeTempDirSync() + "/dangling_symlink";
      if (Oden.build.os === "windows") {
        Oden.symlinkSync("unexistent_file", danglingSymlinkPath, {
          type: "file",
        });
      } else {
        Oden.symlinkSync("unexistent_file", danglingSymlinkPath);
      }
      const pathInfo = Oden.lstatSync(danglingSymlinkPath);
      assert(pathInfo.isSymlink);
      await Oden[method](danglingSymlinkPath);
      assertThrows(() => {
        Oden.lstatSync(danglingSymlinkPath);
      }, Oden.errors.NotFound);
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeValidSymlinkSuccess() {
    for (const method of REMOVE_METHODS) {
      const encoder = new TextEncoder();
      const data = encoder.encode("Test");
      const tempDir = Oden.makeTempDirSync();
      const filePath = tempDir + "/test.txt";
      const validSymlinkPath = tempDir + "/valid_symlink";
      Oden.writeFileSync(filePath, data, { mode: 0o666 });
      if (Oden.build.os === "windows") {
        Oden.symlinkSync(filePath, validSymlinkPath, { type: "file" });
      } else {
        Oden.symlinkSync(filePath, validSymlinkPath);
      }
      const symlinkPathInfo = Oden.statSync(validSymlinkPath);
      assert(symlinkPathInfo.isFile);
      await Oden[method](validSymlinkPath);
      assertThrows(() => {
        Oden.statSync(validSymlinkPath);
      }, Oden.errors.NotFound);
      await Oden[method](filePath);
    }
  },
);

Oden.test({ permissions: { write: false } }, async function removePerm() {
  for (const method of REMOVE_METHODS) {
    await assertRejects(async () => {
      await Oden[method]("/baddir");
    }, Oden.errors.NotCapable);
  }
});

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeAllDirSuccess() {
    for (const method of REMOVE_METHODS) {
      // REMOVE EMPTY DIRECTORY
      let path = Oden.makeTempDirSync() + "/dir/subdir";
      Oden.mkdirSync(path, { recursive: true });
      let pathInfo = Oden.statSync(path);
      assert(pathInfo.isDirectory); // check exist first
      await Oden[method](path, { recursive: true }); // remove
      // We then check again after remove
      assertThrows(
        () => {
          Oden.statSync(path);
        }, // Directory is gone
        Oden.errors.NotFound,
      );

      // REMOVE NON-EMPTY DIRECTORY
      path = Oden.makeTempDirSync() + "/dir/subdir";
      const subPath = path + "/subsubdir";
      Oden.mkdirSync(path, { recursive: true });
      Oden.mkdirSync(subPath);
      pathInfo = Oden.statSync(path);
      assert(pathInfo.isDirectory); // check exist first
      const subPathInfo = Oden.statSync(subPath);
      assert(subPathInfo.isDirectory); // check exist first
      await Oden[method](path, { recursive: true }); // remove
      // We then check parent directory again after remove
      assertThrows(() => {
        Oden.statSync(path);
      }, Oden.errors.NotFound);
      // Directory is gone
    }
  },
);

Oden.test(
  { permissions: { write: true, read: true } },
  async function removeAllFileSuccess() {
    for (const method of REMOVE_METHODS) {
      // REMOVE FILE
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Oden.makeTempDirSync() + "/test.txt";
      Oden.writeFileSync(filename, data, { mode: 0o666 });
      const fileInfo = Oden.statSync(filename);
      assert(fileInfo.isFile); // check exist first
      await Oden[method](filename, { recursive: true }); // remove
      // We then check again after remove
      assertThrows(() => {
        Oden.statSync(filename);
      }, Oden.errors.NotFound);
      // File is gone
    }
  },
);

Oden.test({ permissions: { write: true } }, async function removeAllFail() {
  for (const method of REMOVE_METHODS) {
    // NON-EXISTENT DIRECTORY/FILE
    await assertRejects(
      async () => {
        // Non-existent
        await Oden[method]("/baddir", { recursive: true });
      },
      Oden.errors.NotFound,
      `remove '/baddir'`,
    );
  }
});

Oden.test({ permissions: { write: false } }, async function removeAllPerm() {
  for (const method of REMOVE_METHODS) {
    await assertRejects(async () => {
      await Oden[method]("/baddir", { recursive: true });
    }, Oden.errors.NotCapable);
  }
});

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { write: true, read: true, net: true },
  },
  async function removeUnixSocketSuccess() {
    for (const method of REMOVE_METHODS) {
      // MAKE TEMPORARY UNIX SOCKET
      const path = Oden.makeTempDirSync() + "/test.sock";
      const listener = Oden.listen({ transport: "unix", path });
      Oden.statSync(path); // check if unix socket exists

      await Oden[method](path);
      assertThrows(() => Oden.statSync(path), Oden.errors.NotFound);
      listener.close();
    }
  },
);

if (Oden.build.os === "windows") {
  Oden.test(
    { permissions: { run: true, write: true, read: true } },
    async function removeFileSymlink() {
      const { success } = await new Oden.Command("cmd", {
        args: ["/c", "mklink", "file_link", "bar"],
        stdout: "null",
      }).output();

      assert(success);
      await Oden.remove("file_link");
      await assertRejects(async () => {
        await Oden.lstat("file_link");
      }, Oden.errors.NotFound);
    },
  );

  Oden.test(
    { permissions: { run: true, write: true, read: true } },
    async function removeDirSymlink() {
      const { success } = await new Oden.Command("cmd", {
        args: ["/c", "mklink", "/d", "dir_link", "bar"],
        stdout: "null",
      }).output();

      assert(success);
      await Oden.remove("dir_link");
      await assertRejects(async () => {
        await Oden.lstat("dir_link");
      }, Oden.errors.NotFound);
    },
  );
}
