// Copyright 2018-2026 the Oden authors. MIT license.
import process from "node:process";
import { assertEquals, assertThrows } from "./test_util.ts";

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { sys: ["umask"] },
  },
  function umaskSuccess() {
    const prevMask = Oden.umask(0o020);
    const newMask = Oden.umask(prevMask);
    const finalMask = Oden.umask();
    assertEquals(newMask, 0o020);
    assertEquals(finalMask, prevMask);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { sys: false },
  },
  function umaskRequiresSysPermission() {
    assertThrows(() => {
      Oden.umask();
    }, Oden.errors.NotCapable);
    assertThrows(() => {
      Oden.umask(0);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { sys: ["umask"] },
  },
  function processUmaskSuccess() {
    const initialMask = process.umask();
    const previousMask = process.umask(0o027);
    const changedMask = process.umask(initialMask);
    assertEquals(previousMask, initialMask);
    assertEquals(changedMask, 0o027);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { sys: false },
  },
  function processUmaskRequiresSysPermission() {
    assertThrows(() => {
      process.umask();
    }, Oden.errors.NotCapable);
    assertThrows(() => {
      process.umask(0);
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { sys: ["umask"] },
  },
  async function workerWithoutSysPermissionCannotUseUmask() {
    const prevMask = Oden.umask(0o022);
    const workerUrl = URL.createObjectURL(
      new Blob([
        `
const results = [];
try {
  Oden.umask();
  results.push("read");
} catch (err) {
  results.push(
    err instanceof Oden.errors.NotCapable
      ? "read NotCapable"
      : err instanceof Error
      ? err.name
      : "unknown",
  );
}
try {
  Oden.umask(0);
  results.push("changed");
} catch (err) {
  results.push(
    err instanceof Oden.errors.NotCapable
      ? "set NotCapable"
      : err instanceof Error
      ? err.name
      : "unknown",
  );
}
postMessage(results);
`,
      ], { type: "application/typescript" }),
    );
    const worker = new Worker(workerUrl, {
      type: "module",
      oden: { permissions: "none" },
    });

    try {
      const result = await new Promise((resolve) => {
        worker.onmessage = (event) => resolve(event.data);
      });
      assertEquals(result, ["read NotCapable", "set NotCapable"]);
      assertEquals(Oden.umask(), 0o022);
    } finally {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      Oden.umask(prevMask);
    }
  },
);
