// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "./test_util.ts";

Oden.test({ permissions: { env: true } }, function envSuccess() {
  Oden.env.set("TEST_VAR", "A");
  const env = Oden.env.toObject();
  Oden.env.set("TEST_VAR", "B");
  assertEquals(env["TEST_VAR"], "A");
  assertNotEquals(Oden.env.get("TEST_VAR"), env["TEST_VAR"]);
});

Oden.test({ permissions: { env: true } }, function envNotFound() {
  const r = Oden.env.get("env_var_does_not_exist!");
  assertEquals(r, undefined);
});

Oden.test({ permissions: { env: true } }, function deleteEnv() {
  Oden.env.set("TEST_VAR", "A");
  assertEquals(Oden.env.get("TEST_VAR"), "A");
  assertEquals(Oden.env.delete("TEST_VAR"), undefined);
  assertEquals(Oden.env.get("TEST_VAR"), undefined);
});

Oden.test({ permissions: { env: true } }, function hasEnv() {
  Oden.env.set("TEST_VAR", "A");
  assert(Oden.env.has("TEST_VAR"));
  Oden.env.delete("TEST_VAR");
  assert(!Oden.env.has("TEST_VAR"));
});

Oden.test({ permissions: { env: true } }, function avoidEmptyNamedEnv() {
  assertThrows(() => Oden.env.set("", "v"), TypeError);
  assertThrows(() => Oden.env.set("a=a", "v"), TypeError);
  assertThrows(() => Oden.env.set("a\0a", "v"), TypeError);
  assertThrows(() => Oden.env.set("TEST_VAR", "v\0v"), TypeError);

  assertThrows(() => Oden.env.get(""), TypeError);
  assertThrows(() => Oden.env.get("a=a"), TypeError);
  assertThrows(() => Oden.env.get("a\0a"), TypeError);

  assertThrows(() => Oden.env.delete(""), TypeError);
  assertThrows(() => Oden.env.delete("a=a"), TypeError);
  assertThrows(() => Oden.env.delete("a\0a"), TypeError);
});

// Regression test for https://github.com/denoland/deno/issues/23443
// Every key returned by `toObject()` must be one that `get()` accepts.
// On Windows, cmd.exe injects hidden per-drive cwd variables such as `=C:`
// that contain `=`, which used to be enumerated but were not gettable.
Oden.test({ permissions: { env: true } }, function envToObjectKeysAreValid() {
  for (const key of Object.keys(Oden.env.toObject())) {
    assert(key.length > 0, "toObject() returned an empty key");
    assert(!key.includes("="), `toObject() returned an invalid key: ${key}`);
    assert(!key.includes("\0"), `toObject() returned an invalid key: ${key}`);
    // Must not throw.
    Oden.env.get(key);
  }
});

Oden.test({ permissions: { env: false } }, function envPerm1() {
  assertThrows(() => {
    Oden.env.toObject();
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { env: false } }, function envPerm2() {
  assertThrows(() => {
    Oden.env.get("PATH");
  }, Oden.errors.NotCapable);
});

// This test verifies that on Windows, environment variables are
// case-insensitive. Case normalization needs be done using the collation
// that Windows uses, rather than naively using String.toLowerCase().
Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { read: true, env: true, run: true },
  },
  async function envCaseInsensitive() {
    // Utility function that runs a Oden subprocess with the environment
    // specified in `inputEnv`. The subprocess reads the environment variables
    // which are in the keys of `expectedEnv` and writes them to stdout as JSON.
    // It is then verified that these match with the values of `expectedEnv`.
    const checkChildEnv = async (
      inputEnv: Record<string, string>,
      expectedEnv: Record<string, string>,
    ) => {
      const src = `
      console.log(
        ${
        JSON.stringify(Object.keys(expectedEnv))
      }.map(k => Oden.env.get(k) ?? null)
      )`;
      const { success, stdout } = await new Oden.Command(Oden.execPath(), {
        args: ["eval", src],
        env: { ...inputEnv, NO_COLOR: "1" },
      }).output();
      assertEquals(success, true);
      const expectedValues = Object.values(expectedEnv);
      const actualValues = JSON.parse(new TextDecoder().decode(stdout));
      assertEquals(actualValues, expectedValues);
    };

    assertEquals(Oden.env.get("path"), Oden.env.get("PATH"));
    assertEquals(Oden.env.get("Path"), Oden.env.get("PATH"));

    // Check 'foo', 'Foo' and 'Foo' are case folded.
    await checkChildEnv({ foo: "X" }, { foo: "X", Foo: "X", FOO: "X" });

    // Check that 'µ' and 'Μ' are not case folded.
    const lc1 = "µ";
    const uc1 = lc1.toUpperCase();
    assertNotEquals(lc1, uc1);
    await checkChildEnv(
      { [lc1]: "mu", [uc1]: "MU" },
      { [lc1]: "mu", [uc1]: "MU" },
    );

    // Check that 'ǆ' and 'Ǆ' are folded, but 'ǅ' is preserved.
    const c2 = "ǅ";
    const lc2 = c2.toLowerCase();
    const uc2 = c2.toUpperCase();
    assertNotEquals(c2, lc2);
    assertNotEquals(c2, uc2);
    await checkChildEnv(
      { [c2]: "Dz", [lc2]: "dz" },
      { [c2]: "Dz", [lc2]: "dz", [uc2]: "dz" },
    );
    await checkChildEnv(
      { [c2]: "Dz", [uc2]: "DZ" },
      { [c2]: "Dz", [uc2]: "DZ", [lc2]: "DZ" },
    );
  },
);

Oden.test({ permissions: { env: true } }, function envInvalidChars() {
  assertThrows(() => Oden.env.get(""), TypeError, "Key is an empty string");
  assertThrows(
    () => Oden.env.get("\0"),
    TypeError,
    'Key contains invalid characters: "\\0"',
  );
  assertThrows(
    () => Oden.env.get("="),
    TypeError,
    'Key contains invalid characters: "="',
  );
  assertThrows(
    () => Oden.env.set("", "foo"),
    TypeError,
    "Key is an empty string",
  );
  assertThrows(
    () => Oden.env.set("\0", "foo"),
    TypeError,
    'Key contains invalid characters: "\\0"',
  );
  assertThrows(
    () => Oden.env.set("=", "foo"),
    TypeError,
    'Key contains invalid characters: "="',
  );
  assertThrows(
    () => Oden.env.set("foo", "\0"),
    TypeError,
    'Value contains invalid characters: "\\0"',
  );
});

Oden.test(function osPid() {
  assertEquals(typeof Oden.pid, "number");
  assert(Oden.pid > 0);
});

Oden.test(function osPpid() {
  assertEquals(typeof Oden.ppid, "number");
  assert(Oden.ppid > 0);
});

Oden.test(
  { permissions: { run: true, read: true } },
  async function osPpidIsEqualToPidOfParentProcess() {
    const decoder = new TextDecoder();
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "-p", "Oden.ppid"],
      env: { NO_COLOR: "true" },
    }).output();

    const expected = Oden.pid;
    const actual = parseInt(decoder.decode(stdout));
    assertEquals(actual, expected);
  },
);

Oden.test({ permissions: { read: false } }, function execPath() {
  assertNotEquals(Oden.execPath(), "");
});

Oden.test(
  {
    ignore: Oden.build.os !== "linux",
    permissions: { read: true, run: false },
  },
  function procRequiresAllowAll() {
    assertThrows(
      () => {
        Oden.readTextFileSync("/proc/net/dev");
      },
      Oden.errors.NotCapable,
      `Requires all access to "/proc/net/dev", run again with the --allow-all flag`,
    );
  },
);

Oden.test(
  { permissions: { sys: ["loadavg"] } },
  function loadavgSuccess() {
    const load = Oden.loadavg();
    assertEquals(load.length, 3);
  },
);

Oden.test({ permissions: { sys: false } }, function loadavgPerm() {
  assertThrows(() => {
    Oden.loadavg();
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { sys: ["hostname"] } },
  function hostnameDir() {
    assertNotEquals(Oden.hostname(), "");
  },
);

Oden.test(
  { permissions: { run: [Oden.execPath()], read: true } },
  // See https://github.com/denoland/deno/issues/16527
  async function hostnameWithoutOtherNetworkUsages() {
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "-p", "Oden.hostname()"],
      env: {
        LD_PRELOAD: "",
        LD_LIBRARY_PATH: "",
        DYLD_FALLBACK_LIBRARY_PATH: "",
      },
    }).output();
    const hostname = new TextDecoder().decode(stdout).trim();
    assert(hostname.length > 0);
  },
);

Oden.test({ permissions: { sys: false } }, function hostnamePerm() {
  assertThrows(() => {
    Oden.hostname();
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { sys: ["osRelease"] } },
  function releaseDir() {
    assertNotEquals(Oden.osRelease(), "");
  },
);

Oden.test({ permissions: { sys: false } }, function releasePerm() {
  assertThrows(() => {
    Oden.osRelease();
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { sys: ["osUptime"] } }, function osUptime() {
  const uptime = Oden.osUptime();
  assert(typeof uptime === "number");
  assert(uptime > 0);
});

Oden.test({ permissions: { sys: false } }, function osUptimePerm() {
  assertThrows(() => {
    Oden.osUptime();
  }, Oden.errors.NotCapable);
});

Oden.test(
  { permissions: { sys: ["systemMemoryInfo"] } },
  function systemMemoryInfo() {
    const info = Oden.systemMemoryInfo();
    assert(info.total >= 0);
    assert(info.free >= 0);
    assert(info.available >= 0);
    assert(info.buffers >= 0);
    assert(info.cached >= 0);
    assert(info.swapTotal >= 0);
    assert(info.swapFree >= 0);
  },
);

Oden.test({ permissions: { sys: ["uid"] } }, function getUid() {
  if (Oden.build.os === "windows") {
    assertEquals(Oden.uid(), null);
  } else {
    const uid = Oden.uid();
    assert(typeof uid === "number");
    assert(uid > 0);
  }
});

Oden.test({ permissions: { sys: ["gid"] } }, function getGid() {
  if (Oden.build.os === "windows") {
    assertEquals(Oden.gid(), null);
  } else {
    const gid = Oden.gid();
    assert(typeof gid === "number");
    assert(gid > 0);
  }
});

Oden.test(function memoryUsage() {
  const mem = Oden.memoryUsage();
  assert(typeof mem.rss === "number");
  assert(typeof mem.heapTotal === "number");
  assert(typeof mem.heapUsed === "number");
  assert(typeof mem.external === "number");
  assert(mem.rss >= mem.heapTotal);
});

Oden.test("Oden.exitCode getter and setter", () => {
  // Initial value is 0
  assertEquals(Oden.exitCode, 0);

  try {
    // Set a new value
    Oden.exitCode = 5;
    assertEquals(Oden.exitCode, 5);
  } finally {
    // Reset to initial value
    Oden.exitCode = 0;
  }

  assertEquals(Oden.exitCode, 0);
});

Oden.test("Setting Oden.exitCode to non-number throws TypeError", () => {
  // Throws on non-number values
  assertThrows(
    () => {
      // @ts-expect-error Testing for runtime error
      Oden.exitCode = "123";
    },
    TypeError,
    "Exit code must be a number, got: 123 (string)",
  );

  // Throws on bigint values
  assertThrows(
    () => {
      // @ts-expect-error Testing for runtime error
      Oden.exitCode = 1n;
    },
    TypeError,
    "Exit code must be a number, got: 1 (bigint)",
  );
});

Oden.test("Setting Oden.exitCode to non-integer throws RangeError", () => {
  // Throws on non-integer values
  assertThrows(
    () => {
      Oden.exitCode = 3.14;
    },
    RangeError,
    "Exit code must be an integer, got: 3.14",
  );
});

Oden.test("Setting Oden.exitCode does not cause an immediate exit", () => {
  let exited = false;

  const originalExit = Oden.exit;
  // @ts-expect-error; read-only
  Oden.exit = () => {
    exited = true;
  };

  try {
    Oden.exitCode = 1;
    assertEquals(exited, false);
  } finally {
    Oden.exit = originalExit;
    Oden.exitCode = 0;
  }
});
