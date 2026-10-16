// Copyright 2018-2026 the Oden authors. MIT license.
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import { readlink, readlinkSync } from "node:fs";
import { assert, assertEquals } from "@std/assert";
import * as path from "@std/path";
import { Buffer } from "node:buffer";

const testDir = Oden.makeTempDirSync();
const oldname = path.join(testDir, "oldname");
const newname = path.join(testDir, "newname");

if (Oden.build.os === "windows") {
  Oden.symlinkSync(oldname, newname, { type: "file" });
} else {
  Oden.symlinkSync(oldname, newname);
}

Oden.test({
  name: "readlinkSuccess",
  async fn() {
    const data = await new Promise((res, rej) => {
      readlink(newname, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    assertEquals(typeof data, "string");
    assertEquals(data as string, oldname);
  },
});

Oden.test({
  name: "readlinkEncodeBufferSuccess",
  async fn() {
    const data = await new Promise((res, rej) => {
      readlink(newname, { encoding: "buffer" }, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    assert(data instanceof Uint8Array);
    assertEquals(new TextDecoder().decode(data as Uint8Array), oldname);
  },
});

Oden.test({
  name: "readlinkSyncSuccess",
  fn() {
    const data = readlinkSync(newname);
    assertEquals(typeof data, "string");
    assertEquals(data as string, oldname);
  },
});

Oden.test({
  name: "readlinkEncodeBufferSuccess",
  fn() {
    const data = readlinkSync(newname, { encoding: "buffer" });
    assert(data instanceof Uint8Array);
    assertEquals(new TextDecoder().decode(data as Uint8Array), oldname);
  },
});

Oden.test("[std/node/fs] readlink callback isn't called twice if error is thrown", async () => {
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { readlink } from ${JSON.stringify(importUrl)}`,
    invocation: `readlink(${JSON.stringify(newname)}, `,
  });
});

Oden.test("[node/fs] readlink accepts Buffer as path", async () => {
  const data = await new Promise((res, rej) => {
    readlink(Buffer.from(newname), (err, data) => {
      if (err) {
        rej(err);
      }
      res(data);
    });
  });
  assertEquals(data, oldname);
});

Oden.test("[node/fs] readlinkSync accepts Buffer as path", () => {
  const data = readlinkSync(Buffer.from(newname));
  assertEquals(data, oldname);
});
