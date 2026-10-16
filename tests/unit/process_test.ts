// deno-lint-ignore-file no-deprecated-oden-api
// Copyright 2018-2026 the Oden authors. MIT license.
import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertStringIncludes,
  assertThrows,
} from "./test_util.ts";

Oden.test(
  { permissions: { read: true, run: false } },
  function runPermissions() {
    assertThrows(() => {
      // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
      Oden.run({
        cmd: [Oden.execPath(), "eval", "console.log('hello world')"],
      });
    }, Oden.errors.NotCapable);
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runSuccess() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      // freeze the array to ensure it's not modified
      cmd: Object.freeze([
        Oden.execPath(),
        "eval",
        "console.log('hello world')",
      ]),
      stdout: "piped",
      stderr: "null",
    });
    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.stdout.close();
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runUrl() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        new URL(`file:///${Oden.execPath()}`),
        "eval",
        "console.log('hello world')",
      ],
      stdout: "piped",
      stderr: "null",
    });
    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.stdout.close();
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runStdinRid0(): Promise<
    void
  > {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "eval", "console.log('hello world')"],
      stdin: 0,
      stdout: "piped",
      stderr: "null",
    });
    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.stdout.close();
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  function runInvalidStdio() {
    assertThrows(() =>
      // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
      Oden.run({
        cmd: [Oden.execPath(), "eval", "console.log('hello world')"],
        stdin: "a",
      })
    );
    assertThrows(() =>
      // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
      Oden.run({
        cmd: [Oden.execPath(), "eval", "console.log('hello world')"],
        stdout: "b",
      })
    );
    assertThrows(() =>
      // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
      Oden.run({
        cmd: [Oden.execPath(), "eval", "console.log('hello world')"],
        stderr: "c",
      })
    );
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runCommandFailedWithCode() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "eval", "Oden.exit(41 + 1)"],
    });
    const status = await p.status();
    assertEquals(status.success, false);
    assertEquals(status.code, 42);
    assertEquals(status.signal, undefined);
    p.close();
  },
);

Oden.test(
  {
    permissions: { run: true, read: true },
  },
  async function runCommandFailedWithSignal() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "Oden.kill(Oden.pid, 'SIGKILL')",
      ],
    });
    const status = await p.status();
    assertEquals(status.success, false);
    if (Oden.build.os === "windows") {
      assertEquals(status.code, 1);
      assertEquals(status.signal, undefined);
    } else {
      assertEquals(status.code, 128 + 9);
      assertEquals(status.signal, 9);
    }
    p.close();
  },
);

Oden.test({ permissions: { run: true } }, function runNotFound() {
  let error;
  try {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    Oden.run({ cmd: ["this file hopefully doesn't exist"] });
  } catch (e) {
    error = e;
  }
  assert(error !== undefined);
  assert(error instanceof Oden.errors.NotFound);
});

Oden.test(
  { permissions: { write: true, run: true, read: true } },
  async function runWithCwdIsAsync() {
    const enc = new TextEncoder();
    const cwd = await Oden.makeTempDir({ prefix: "oden_command_test" });

    const exitCodeFile = "oden_was_here";
    const programFile = "poll_exit.ts";
    const program = `
async function tryExit() {
  try {
    const code = parseInt(await Oden.readTextFile("${exitCodeFile}"));
    Oden.exit(code);
  } catch {
    // Retry if we got here before oden wrote the file.
    setTimeout(tryExit, 0.01);
  }
}

tryExit();
`;

    Oden.writeFileSync(`${cwd}/${programFile}`, enc.encode(program));
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cwd,
      cmd: [Oden.execPath(), "run", "--allow-read", programFile],
    });

    // Write the expected exit code *after* starting oden.
    // This is how we verify that `run()` is actually asynchronous.
    const code = 84;
    Oden.writeFileSync(`${cwd}/${exitCodeFile}`, enc.encode(`${code}`));

    const status = await p.status();
    assertEquals(status.success, false);
    assertEquals(status.code, code);
    assertEquals(status.signal, undefined);
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runStdinPiped(): Promise<
    void
  > {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        `
        const buffer = new Uint8Array(5);
        await Oden.stdin.read(buffer);
        if (new TextDecoder().decode(buffer) !== "hello") {
          throw new Error('Expected \\'hello\\'')
        }
        `,
      ],
      stdin: "piped",
    });
    assert(p.stdin);
    assert(!p.stdout);
    assert(!p.stderr);

    const msg = new TextEncoder().encode("hello");
    const n = await p.stdin.write(msg);
    assertEquals(n, msg.byteLength);

    p.stdin.close();

    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runStdoutPiped(): Promise<
    void
  > {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "await Oden.stdout.write(new TextEncoder().encode('hello'))",
      ],
      stdout: "piped",
    });
    assert(!p.stdin);
    assert(!p.stderr);

    const data = new Uint8Array(10);
    let r = await p.stdout.read(data);
    if (r === null) {
      throw new Error("p.stdout.read(...) should not be null");
    }
    assertEquals(r, 5);
    const s = new TextDecoder().decode(data.subarray(0, r));
    assertEquals(s, "hello");
    r = await p.stdout.read(data);
    assertEquals(r, null);
    p.stdout.close();

    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runStderrPiped(): Promise<
    void
  > {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "await Oden.stderr.write(new TextEncoder().encode('hello'))",
      ],
      stderr: "piped",
    });
    assert(!p.stdin);
    assert(!p.stdout);

    const data = new Uint8Array(10);
    let r = await p.stderr.read(data);
    if (r === null) {
      throw new Error("p.stderr.read should not return null here");
    }
    assertEquals(r, 5);
    const s = new TextDecoder().decode(data.subarray(0, r));
    assertEquals(s, "hello");
    r = await p.stderr.read(data);
    assertEquals(r, null);
    p.stderr!.close();

    const status = await p.status();
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, undefined);
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runOutput() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "await Oden.stdout.write(new TextEncoder().encode('hello'))",
      ],
      stdout: "piped",
    });
    const output = await p.output();
    const s = new TextDecoder().decode(output);
    assertEquals(s, "hello");
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runStderrOutput(): Promise<
    void
  > {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "await Oden.stderr.write(new TextEncoder().encode('error'))",
      ],
      stderr: "piped",
    });
    const error = await p.stderrOutput();
    const s = new TextDecoder().decode(error);
    assertEquals(s, "error");
    p.close();
  },
);

Oden.test(
  {
    permissions: { run: true, write: true, read: true },
  },
  async function runRedirectStdoutStderr() {
    const tempDir = await Oden.makeTempDir();
    const fileName = tempDir + "/redirected_stdio.txt";
    using file = await Oden.open(fileName, {
      create: true,
      write: true,
    });

    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "Oden.stderr.write(new TextEncoder().encode('error\\n')); Oden.stdout.write(new TextEncoder().encode('output\\n'));",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    await p.stdout.readable.pipeTo(file.writable, { preventClose: true });
    await p.stderr.readable.pipeTo(file.writable);
    await p.status();
    p.close();

    const fileContents = await Oden.readFile(fileName);
    const decoder = new TextDecoder();
    const text = decoder.decode(fileContents);

    assertStringIncludes(text, "error");
    assertStringIncludes(text, "output");
    // deno-lint-ignore no-console
    console.log("finished tgis test");
  },
);

Oden.test(
  {
    permissions: { run: true, write: true, read: true },
  },
  async function runRedirectStdin() {
    const tempDir = await Oden.makeTempDir();
    const fileName = tempDir + "/redirected_stdio.txt";
    await Oden.writeTextFile(fileName, "hello");
    using file = await Oden.open(fileName);

    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        `
        const buffer = new Uint8Array(5);
        await Oden.stdin.read(buffer);
        if (new TextDecoder().decode(buffer) !== "hello") {
          throw new Error('Expected \\'hello\\'')
        }
        `,
      ],
      stdin: "piped",
    });

    await file.readable.pipeTo(p.stdin.writable);
    const status = await p.status();
    assertEquals(status.code, 0);
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runEnv() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "Oden.stdout.write(new TextEncoder().encode(Oden.env.get('FOO') + Oden.env.get('BAR')))",
      ],
      env: {
        FOO: "0123",
        BAR: "4567",
      },
      stdout: "piped",
    });
    const output = await p.output();
    const s = new TextDecoder().decode(output);
    assertEquals(s, "01234567");
    p.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runClose() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        "setTimeout(() => Oden.stdout.write(new TextEncoder().encode('error')), 10000)",
      ],
      stderr: "piped",
    });
    assert(!p.stdin);
    assert(!p.stdout);

    p.close();

    const data = new Uint8Array(10);
    const r = await p.stderr.read(data);
    assertEquals(r, null);
    p.stderr.close();
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function runKillAfterStatus() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "eval", 'console.log("hello")'],
    });
    await p.status();

    let error = null;
    try {
      p.kill("SIGTERM");
    } catch (e) {
      error = e;
    }

    assert(
      error instanceof Oden.errors.NotFound ||
        // On Windows, the underlying Windows API may return
        // `ERROR_ACCESS_DENIED` when the process has exited, but hasn't been
        // completely cleaned up yet and its `pid` is still valid.
        (Oden.build.os === "windows" &&
          error instanceof Oden.errors.PermissionDenied),
    );

    p.close();
  },
);

Oden.test({ permissions: { run: false } }, function killPermissions() {
  assertThrows(() => {
    // Signalling a process other than the current one still requires
    // --allow-run. We use a pid that is not our own; the permission check
    // happens before the signal is delivered, so it does not matter whether
    // the pid refers to a live process.
    Oden.kill(Oden.pid + 1, "SIGCONT");
  }, Oden.errors.NotCapable);
});

Oden.test({ permissions: { run: false } }, function killSelfNoPermissions() {
  // Sending a signal to the current process is functionally equivalent to
  // terminating yourself, which never required permissions. Signal 0 is a
  // liveness check that does not deliver a signal, so it works cross-platform
  // without requiring --allow-run.
  Oden.kill(Oden.pid, 0);
});

Oden.test(
  { ignore: Oden.build.os !== "windows", permissions: { run: true } },
  function negativePidInvalidWindows() {
    assertThrows(() => {
      Oden.kill(-1, "SIGTERM");
    }, TypeError);
  },
);

Oden.test(
  { ignore: Oden.build.os !== "windows", permissions: { run: true } },
  function invalidSignalNameWindows() {
    assertThrows(() => {
      Oden.kill(Oden.pid, "SIGUSR1");
    }, TypeError);
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function killSuccess() {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "eval", "setTimeout(() => {}, 10000)"],
    });

    try {
      Oden.kill(p.pid, "SIGKILL");
      const status = await p.status();

      assertEquals(status.success, false);
      if (Oden.build.os === "windows") {
        assertEquals(status.code, 1);
        assertEquals(status.signal, undefined);
      } else {
        assertEquals(status.code, 137);
        assertEquals(status.signal, 9);
      }
    } finally {
      p.close();
    }
  },
);

Oden.test({ permissions: { run: true, read: true } }, function killFailed() {
  // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
  const p = Oden.run({
    cmd: [Oden.execPath(), "eval", "setTimeout(() => {}, 10000)"],
  });
  assert(!p.stdin);
  assert(!p.stdout);

  assertThrows(() => {
    // @ts-expect-error testing runtime error of bad signal
    Oden.kill(p.pid, "foobar");
  }, TypeError);

  p.close();
});

Oden.test(
  {
    permissions: { run: true, read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  async function nonExistentCwd(): Promise<void> {
    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [
        Oden.execPath(),
        "eval",
        `const dir = Oden.makeTempDirSync();
        Oden.chdir(dir);
        Oden.removeSync(dir);
        const p = Oden.run({cmd:[Oden.execPath(), "eval", "console.log(1);"]});
        const { code } = await p.status();
        p.close();
        Oden.exit(code);
        `,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await p.status();
    const stderr = new TextDecoder().decode(await p.stderrOutput());
    p.close();
    p.stdout.close();
    assertStrictEquals(code, 1);
    assertStringIncludes(stderr, "failed resolving cwd:");
  },
);

Oden.test(
  {
    permissions: { run: true, read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  async function runWatchAndSigint(): Promise<void> {
    const tempDir = await Oden.makeTempDir();
    const tempFile = `${tempDir}/temp_watch_file.ts`;
    await Oden.writeTextFile(tempFile, "console.log('watch test');");

    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "run", "--watch", tempFile],
      stdout: "piped",
      stderr: "null",
    });

    Oden.kill(p.pid, "SIGINT");
    const data = new Uint8Array(10);
    const out = await p.stdout.read(data);
    assertEquals(out, null);
    p.stdout.close();
    p.close();

    await Oden.remove(tempFile);
    await Oden.remove(tempDir);
  },
);

Oden.test(
  {
    permissions: { run: true, read: true, write: true },
    ignore: Oden.build.os === "windows",
  },
  async function runWatchWaitForSigint(): Promise<void> {
    const tempDir = await Oden.makeTempDir();
    const tempFile = `${tempDir}/temp_watch_file.ts`;
    await Oden.writeTextFile(
      tempFile,
      `Oden.addSignalListener("SIGINT", () => {
  console.log("SIGINT");
  ac.abort();
});

Oden.serve({ signal: ac.signal }, () => new Response("Hello World"));
`,
    );

    // @ts-ignore `Oden.run()` was soft-removed in Oden 2.
    const p = Oden.run({
      cmd: [Oden.execPath(), "run", "--watch", tempFile],
      stdout: "piped",
      stderr: "null",
    });

    Oden.kill(p.pid, "SIGINT");
    const data = new Uint8Array(10);
    const out = await p.stdout.read(data);
    assertEquals(out, null);
    p.stdout.close();
    p.close();

    await Oden.remove(tempFile);
    await Oden.remove(tempDir);
  },
);

Oden.test({
  name: "process.ppid matches parent process",
  permissions: { run: true, read: true },
  ignore: Oden.build.os === "windows",
  async fn() {
    const command = new Oden.Command(Oden.execPath(), {
      args: [
        "eval",
        "import { ppid } from 'node:process'; console.log(ppid);",
      ],
      stdout: "piped",
    });

    const { stdout } = await command.output();
    const stdoutPpid = parseInt(
      new TextDecoder().decode(stdout).trim(),
    );

    assertEquals(stdoutPpid, Oden.pid);
  },
});
