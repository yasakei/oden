// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Oden.test(async function permissionInvalidName() {
  await assertRejects(async () => {
    // deno-lint-ignore no-explicit-any
    await Oden.permissions.query({ name: "foo" as any });
  }, TypeError);
});

Oden.test(function permissionInvalidNameSync() {
  assertThrows(() => {
    // deno-lint-ignore no-explicit-any
    Oden.permissions.querySync({ name: "foo" as any });
  }, TypeError);
});

Oden.test(
  { permissions: { net: [] } },
  async function permissionNetInvalidHost() {
    await assertRejects(async () => {
      await Oden.permissions.query({ name: "net", host: ":" });
    }, URIError);
  },
);

Oden.test(
  { permissions: { net: [] } },
  function permissionNetInvalidHostSync() {
    assertThrows(() => {
      Oden.permissions.querySync({ name: "net", host: ":" });
    }, URIError);
  },
);

Oden.test(
  { permissions: { sys: [] } },
  async function permissionSysValidKind() {
    await Oden.permissions.query({ name: "sys", kind: "loadavg" });
    await Oden.permissions.query({ name: "sys", kind: "osRelease" });
    await Oden.permissions.query({ name: "sys", kind: "osUptime" });
    await Oden.permissions.query({ name: "sys", kind: "networkInterfaces" });
    await Oden.permissions.query({ name: "sys", kind: "systemMemoryInfo" });
    await Oden.permissions.query({ name: "sys", kind: "hostname" });
    await Oden.permissions.query({ name: "sys", kind: "uid" });
    await Oden.permissions.query({ name: "sys", kind: "gid" });
    await Oden.permissions.query({ name: "sys", kind: "cpus" });
  },
);

Oden.test(
  { permissions: { sys: [] } },
  function permissionSysValidKindSync() {
    Oden.permissions.querySync({ name: "sys", kind: "loadavg" });
    Oden.permissions.querySync({ name: "sys", kind: "osRelease" });
    Oden.permissions.querySync({ name: "sys", kind: "networkInterfaces" });
    Oden.permissions.querySync({ name: "sys", kind: "systemMemoryInfo" });
    Oden.permissions.querySync({ name: "sys", kind: "hostname" });
    Oden.permissions.querySync({ name: "sys", kind: "uid" });
    Oden.permissions.querySync({ name: "sys", kind: "gid" });
    Oden.permissions.querySync({ name: "sys", kind: "cpus" });
  },
);

Oden.test(
  { permissions: { sys: [] } },
  async function permissionSysInvalidKind() {
    await assertRejects(async () => {
      // deno-lint-ignore no-explicit-any
      await Oden.permissions.query({ name: "sys", kind: "abc" as any });
    }, TypeError);
  },
);

Oden.test(
  { permissions: { sys: [] } },
  function permissionSysInvalidKindSync() {
    assertThrows(() => {
      // deno-lint-ignore no-explicit-any
      Oden.permissions.querySync({ name: "sys", kind: "abc" as any });
    }, TypeError);
  },
);

Oden.test(async function permissionQueryReturnsEventTarget() {
  const status = await Oden.permissions.query({ name: "read", path: "." });
  assert(["granted", "denied", "prompt"].includes(status.state));
  let called = false;
  status.addEventListener("change", () => {
    called = true;
  });
  status.dispatchEvent(new Event("change"));
  assert(called);
  assert(
    status === (await Oden.permissions.query({ name: "read", path: "." })),
  );
});

Oden.test(function permissionQueryReturnsEventTargetSync() {
  const status = Oden.permissions.querySync({ name: "read", path: "." });
  assert(["granted", "denied", "prompt"].includes(status.state));
  let called = false;
  status.addEventListener("change", () => {
    called = true;
  });
  status.dispatchEvent(new Event("change"));
  assert(called);
  assert(status === Oden.permissions.querySync({ name: "read", path: "." }));
});

Oden.test(async function permissionQueryForReadReturnsSameStatus() {
  const status1 = await Oden.permissions.query({
    name: "read",
    path: ".",
  });
  const status2 = await Oden.permissions.query({
    name: "read",
    path: ".",
  });
  assert(status1 === status2);
});

Oden.test(function permissionQueryForReadReturnsSameStatusSync() {
  const status1 = Oden.permissions.querySync({
    name: "read",
    path: ".",
  });
  const status2 = Oden.permissions.querySync({
    name: "read",
    path: ".",
  });
  assert(status1 === status2);
});

Oden.test(function permissionsIllegalConstructor() {
  assertThrows(() => new Oden.Permissions(), TypeError, "Illegal constructor");
  assertEquals(Oden.Permissions.length, 0);
});

Oden.test(function permissionStatusIllegalConstructor() {
  assertThrows(
    () => new Oden.PermissionStatus(),
    TypeError,
    "Illegal constructor",
  );
  assertEquals(Oden.PermissionStatus.length, 0);
});

// Regression test for https://github.com/denoland/deno/issues/17020
Oden.test(
  { permissions: { read: [], write: [], ffi: [], run: [] } },
  async function permissionURL() {
    const path = new URL(".", import.meta.url);

    await Oden.permissions.query({ name: "read", path });
    await Oden.permissions.query({ name: "write", path });
    await Oden.permissions.query({ name: "ffi", path });
    await Oden.permissions.query({ name: "run", command: path });
  },
);

Oden.test(
  { permissions: { read: [], write: [], ffi: [], run: [] } },
  function permissionURLSync() {
    Oden.permissions.querySync({
      name: "read",
      path: new URL(".", import.meta.url),
    });
    Oden.permissions.querySync({
      name: "write",
      path: new URL(".", import.meta.url),
    });
    Oden.permissions.querySync({
      name: "run",
      command: new URL(".", import.meta.url),
    });
  },
);

Oden.test(async function permissionDescriptorValidation() {
  for (const value of [undefined, null, {}]) {
    for (const method of ["query", "request", "revoke"]) {
      await assertRejects(
        async () => {
          // deno-lint-ignore no-explicit-any
          await (Oden.permissions as any)[method](value as any);
        },
        TypeError,
        '"undefined" is not a valid permission name',
      );
    }
  }
});

Oden.test(function permissionDescriptorValidationSync() {
  for (const value of [undefined, null, {}]) {
    for (const method of ["querySync", "revokeSync", "requestSync"]) {
      assertThrows(
        () => {
          // deno-lint-ignore no-explicit-any
          (Oden.permissions as any)[method](value as any);
        },
        TypeError,
        '"undefined" is not a valid permission name',
      );
    }
  }
});

// Regression test for https://github.com/denoland/deno/issues/15894.
Oden.test(async function permissionStatusObjectsNotEqual() {
  assert(
    await Oden.permissions.query({ name: "env", variable: "A" }) !=
      await Oden.permissions.query({ name: "env", variable: "B" }),
  );
});

Oden.test(function permissionStatusObjectsNotEqualSync() {
  assert(
    Oden.permissions.querySync({ name: "env", variable: "A" }) !=
      Oden.permissions.querySync({ name: "env", variable: "B" }),
  );
});

Oden.test(
  { permissions: { import: ["jsr.io:443"] } },
  async function permissionQueryImport() {
    await Oden.permissions.query({ name: "import", host: "jsr.io:443" });
    await Oden.permissions.query({ name: "import", host: "oden.test:443" });
  },
);

Oden.test(
  { permissions: { read: true } },
  function permissionDevTtyReadAllowed() {
    if (Oden.build.os !== "linux" && Oden.build.os !== "darwin") {
      return;
    }
    try {
      const f = Oden.openSync("/dev/tty", { read: true });
      f.close();
    } catch (e) {
      // CI environments may lack /dev/tty (NXIO). We only check for permission errors.
      if (e instanceof Oden.errors.NotCapable) {
        throw e;
      }
    }
  },
);

Oden.test(
  { permissions: { read: true, write: true } },
  function permissionDevTtyWriteBlocked() {
    if (Oden.build.os !== "linux" && Oden.build.os !== "darwin") {
      return;
    }
    assertThrows(() => {
      // Write access to /dev/tty is always blocked to prevent prompt spoofing.
      const f = Oden.openSync("/dev/tty", { write: true });
      f.close();
    }, Oden.errors.NotCapable);
  },
);
