// deno-lint-ignore-file no-undef
// Copyright 2018-2026 the Oden authors. MIT license.

import os from "node:os";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import console from "node:console";

Oden.test({
  name: "build architecture is a string",
  fn() {
    assertEquals(typeof os.arch(), "string");
  },
});

Oden.test({
  name: "build architecture",
  fn() {
    if (Oden.build.arch == "x86_64") {
      assertEquals(os.arch(), "x64");
    } else if (Oden.build.arch == "aarch64") {
      assertEquals(os.arch(), "arm64");
    } else {
      throw new Error("unreachable");
    }
  },
});

Oden.test({
  name: "os machine (arch)",
  fn() {
    if (Oden.build.arch == "aarch64") {
      assertEquals(os.machine(), "arm64");
    } else {
      assertEquals(os.machine(), Oden.build.arch);
    }
  },
});

Oden.test({
  name: "home directory is a string",
  fn() {
    assertEquals(typeof os.homedir(), "string");
  },
});

Oden.test({
  name: "home directory when HOME is not set",
  fn() {
    Oden.env.delete("HOME");
    assertEquals(typeof os.homedir(), "string");
  },
});

Oden.test({
  name: "tmp directory is a string",
  fn() {
    assertEquals(typeof os.tmpdir(), "string");
  },
});

Oden.test({
  name: "hostname is a string",
  fn() {
    assertEquals(typeof os.hostname(), "string");
  },
});

Oden.test({
  name: "platform is a string",
  fn() {
    assertEquals(typeof os.platform(), "string");
  },
});

Oden.test({
  name: "release is a string",
  fn() {
    assertEquals(typeof os.release(), "string");
  },
});

Oden.test({
  name: "type is a string",
  fn() {
    assertEquals(typeof os.type(), "string");
  },
});

Oden.test({
  name: "getPriority(): PID must be a 32 bit integer",
  fn() {
    assertThrows(
      () => {
        os.getPriority(3.15);
      },
      Error,
      'The value of "pid" is out of range. It must be an integer',
    );
    assertThrows(
      () => {
        os.getPriority(9999999999);
      },
      Error,
      'The value of "pid" is out of range. It must be >= -2147483648 && <= 2147483647',
    );
  },
});

Oden.test({
  name: "setPriority(): PID must be a 32 bit integer",
  fn() {
    assertThrows(
      () => {
        os.setPriority(3.15, 0);
      },
      Error,
      `The value of "pid" is out of range. It must be an integer`,
    );
    assertThrows(
      () => {
        os.setPriority(9999999999, 0);
      },
      Error,
      'The value of "pid" is out of range. It must be >= -2147483648 && <= 2147483647',
    );
  },
});

Oden.test({
  name: "setPriority(): priority must be an integer between -20 and 19",
  fn() {
    assertThrows(
      () => {
        os.setPriority(0, 3.15);
      },
      Error,
      'The value of "priority" is out of range. It must be an integer',
    );
    assertThrows(
      () => {
        os.setPriority(0, -21);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
    assertThrows(
      () => {
        os.setPriority(0, 20);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
    assertThrows(
      () => {
        os.setPriority(0, 9999999999);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
  },
});

Oden.test({
  name:
    "setPriority(): if only one argument specified, then this is the priority, NOT the pid",
  fn() {
    assertThrows(
      () => {
        os.setPriority(3.15);
      },
      Error,
      'The value of "priority" is out of range. It must be an integer',
    );
    assertThrows(
      () => {
        os.setPriority(-21);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
    assertThrows(
      () => {
        os.setPriority(20);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
    assertThrows(
      () => {
        os.setPriority(9999999999);
      },
      Error,
      'The value of "priority" is out of range. It must be >= -20 && <= 19',
    );
  },
});

Oden.test({
  name: "EOL is as expected",
  fn() {
    assert(os.EOL == "\r\n" || os.EOL == "\n");
  },
});

Oden.test({
  name: "Endianness is determined",
  fn() {
    assert(["LE", "BE"].includes(os.endianness()));
  },
});

Oden.test({
  name: "Load average is an array of 3 numbers",
  fn() {
    const result = os.loadavg();
    assert(result.length == 3);
    assertEquals(typeof result[0], "number");
    assertEquals(typeof result[1], "number");
    assertEquals(typeof result[2], "number");
  },
});

Oden.test({
  name: "Primitive coercion works as expected",
  fn() {
    assertEquals(`${os.arch}`, os.arch());
    assertEquals(`${os.endianness}`, os.endianness());
    assertEquals(`${os.platform}`, os.platform());
  },
});

Oden.test({
  name: "Total memory amount should be greater than 0",
  fn() {
    assert(os.totalmem() > 0);
  },
});

Oden.test({
  name: "Free memory amount should be greater than 0",
  fn() {
    assert(os.freemem() > 0);
  },
});

Oden.test({
  name: "Uptime should be greater than 0",
  fn() {
    assert(os.uptime() > 0);
  },
});

Oden.test({
  name: "os.cpus()",
  fn() {
    assertEquals(os.cpus().length, navigator.hardwareConcurrency);

    for (const cpu of os.cpus()) {
      assert(cpu.model.length > 0);
      assert(cpu.speed >= 0);
      assert(cpu.times.user > 0);
      assert(cpu.times.sys > 0);
      assert(cpu.times.idle > 0);
    }
  },
});

Oden.test({
  name: "os.setPriority() & os.getPriority()",
  // disabled because os.getPriority() doesn't work without sudo
  ignore: true,
  fn() {
    const child = new Oden.Command(Oden.execPath(), {
      args: ["eval", "while (true) { console.log('foo') }"],
    }).spawn();
    const originalPriority = os.getPriority(child.pid);
    assertNotEquals(originalPriority, os.constants.priority.PRIORITY_HIGH);
    os.setPriority(child.pid, os.constants.priority.PRIORITY_HIGH);
    assertEquals(
      os.getPriority(child.pid),
      os.constants.priority.PRIORITY_HIGH,
    );
    os.setPriority(child.pid, originalPriority);
    assertEquals(os.getPriority(child.pid), originalPriority);
    child.kill();
  },
});

Oden.test({
  name:
    "os.setPriority() throw os permission denied error & os.getPriority() doesn't",
  // Windows allows setting process priority without privilege escalation up to `PRIORITY_HIGH`.
  // Setting to `PRIORITY_HIGHEST` will be silently reduced to `PRIORITY_HIGH`.
  ignore: Oden.build.os === "windows",
  async fn() {
    const child = new Oden.Command(Oden.execPath(), {
      args: ["eval", "while (true) { console.log('foo') }"],
    }).spawn();
    assertThrows(
      () => {
        try {
          os.setPriority(child.pid, os.constants.priority.PRIORITY_HIGH);
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
      Error,
      "uv_os_setpriority returned EACCES (permission denied)",
    );
    os.getPriority(child.pid);
    child.kill();
    await child.status;
  },
});

Oden.test({
  name: "os.setPriority() works on Windows",
  ignore: Oden.build.os !== "windows",
  async fn() {
    const child = new Oden.Command(Oden.execPath(), {
      args: ["eval", "while (true) { console.log('foo') }"],
    }).spawn();

    const originalPriority = os.getPriority(child.pid);
    assertNotEquals(originalPriority, os.constants.priority.PRIORITY_HIGH);
    os.setPriority(child.pid, os.constants.priority.PRIORITY_HIGH);

    assertEquals(
      os.getPriority(child.pid),
      os.constants.priority.PRIORITY_HIGH,
    );

    os.setPriority(child.pid, originalPriority);
    assertEquals(os.getPriority(child.pid), originalPriority);
    child.kill();
    await child.status;
  },
});

// Gets the diff in log_10 scale
function diffLog10(a: number, b: number): number {
  return Math.abs(Math.log10(a) - Math.log10(b));
}

Oden.test({
  name:
    "os.freemem() is equivalent of Oden.systemMemoryInfo().free except on linux",
  ignore: Oden.build.os === "linux",
  fn() {
    const diff = diffLog10(os.freemem(), Oden.systemMemoryInfo().free);
    assert(diff < 1);
  },
});

Oden.test({
  name:
    "os.freemem() is equivalent of Oden.systemMemoryInfo().available on linux",
  ignore: Oden.build.os !== "linux",
  fn() {
    const diff = diffLog10(os.freemem(), Oden.systemMemoryInfo().available);
    assert(diff < 1);
  },
});
