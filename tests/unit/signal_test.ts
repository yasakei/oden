// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals, assertThrows, delay } from "./test_util.ts";

Oden.test(
  { ignore: Oden.build.os !== "windows" },
  function windowsUnsupportedSignalsTest() {
    // These signals are Unix-only and not supported on Windows at all.
    const unsupported = [
      "SIGALRM",
      "SIGCHLD",
      "SIGFPE",
      "SIGILL",
      "SIGIO",
      "SIGPIPE",
      "SIGSEGV",
      "SIGUSR1",
      "SIGUSR2",
    ];
    for (const sig of unsupported) {
      assertThrows(
        () => {
          Oden.addSignalListener(sig as Oden.Signal, () => {});
        },
        Error,
        `Invalid signal: ${sig}`,
      );
    }
  },
);

Oden.test(
  { ignore: Oden.build.os !== "windows" },
  function windowsForbiddenSignalsTest() {
    // These signals exist on Windows but are forbidden to listen for
    // (uncatchable/fatal signals).
    assertThrows(
      () => Oden.addSignalListener("SIGKILL", () => {}),
      TypeError,
      "Binding to signal 'SIGKILL' is not allowed",
    );
    assertThrows(
      () => Oden.addSignalListener("SIGABRT", () => {}),
      TypeError,
      "Binding to signal 'SIGABRT' is not allowed",
    );
  },
);

Oden.test(
  { ignore: Oden.build.os !== "windows" },
  function windowsSupportedSignalsTest() {
    // These signals should be registerable on Windows.
    const supported: Oden.Signal[] = [
      "SIGINT",
      "SIGBREAK",
      "SIGHUP",
      "SIGTERM",
      "SIGQUIT",
      "SIGWINCH",
    ];
    for (const sig of supported) {
      const listener = () => {};
      Oden.addSignalListener(sig, listener);
      Oden.removeSignalListener(sig, listener);
    }
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { run: true },
  },
  async function signalListenerTest() {
    let c = 0;
    const listener = () => {
      c += 1;
    };
    // This test needs to be careful that it doesn't accidentally aggregate multiple
    // signals into one. Sending two or more SIGxxx before the handler can be run will
    // result in signal coalescing.
    Oden.addSignalListener("SIGUSR1", listener);
    // Sends SIGUSR1 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Oden.kill(Oden.pid, "SIGUSR1");
      while (c < i) {
        await delay(20);
      }
    }
    Oden.removeSignalListener("SIGUSR1", listener);
    await delay(100);
    assertEquals(c, 3);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { run: true },
  },
  async function multipleSignalListenerTest() {
    let c = "";
    const listener0 = () => {
      c += "0";
    };
    const listener1 = () => {
      c += "1";
    };
    // This test needs to be careful that it doesn't accidentally aggregate multiple
    // signals into one. Sending two or more SIGxxx before the handler can be run will
    // result in signal coalescing.
    Oden.addSignalListener("SIGUSR2", listener0);
    Oden.addSignalListener("SIGUSR2", listener1);

    // Sends SIGUSR2 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Oden.kill(Oden.pid, "SIGUSR2");
      while (c.length < i * 2) {
        await delay(20);
      }
    }

    Oden.removeSignalListener("SIGUSR2", listener1);

    // Sends SIGUSR2 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Oden.kill(Oden.pid, "SIGUSR2");
      while (c.length < 6 + i) {
        await delay(20);
      }
    }

    // Sends SIGUSR1 (irrelevant signal) 3 times.
    // By default SIGUSR1 terminates, so set it to a no-op for this test.
    let count = 0;
    const irrelevant = () => {
      count++;
    };
    Oden.addSignalListener("SIGUSR1", irrelevant);
    for (const _ of Array(3)) {
      await delay(20);
      Oden.kill(Oden.pid, "SIGUSR1");
    }
    while (count < 3) {
      await delay(20);
    }
    Oden.removeSignalListener("SIGUSR1", irrelevant);

    // No change
    assertEquals(c, "010101000");

    Oden.removeSignalListener("SIGUSR2", listener0);

    await delay(100);

    // The first 3 events are handled by both handlers
    // The last 3 events are handled only by handler0
    assertEquals(c, "010101000");
  },
);

// This tests that pending op_signal_poll doesn't block the runtime from exiting the process.
Oden.test(
  {
    permissions: { run: true, read: true },
  },
  async function canExitWhileListeningToSignal() {
    const { code } = await new Oden.Command(Oden.execPath(), {
      args: [
        "eval",
        "Oden.addSignalListener('SIGINT', () => {})",
      ],
    }).output();
    assertEquals(code, 0);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { run: true },
  },
  async function workerSignalListenerIsRemovedOnTerminate() {
    const childCode = `
      const workerCode = \`
        Oden.addSignalListener("SIGTERM", () => {});
        self.postMessage("registered");
        setInterval(() => {}, 1000);
      \`;
      const worker = new Worker(
        "data:application/javascript," + encodeURIComponent(workerCode),
        { type: "module" },
      );
      await new Promise((resolve) => {
        worker.onmessage = resolve;
      });
      worker.terminate();
      await new Promise((resolve) => setTimeout(resolve, 250));
      console.log("ready");
      setInterval(() => {}, 1000);
    `;

    const child = new Oden.Command(Oden.execPath(), {
      args: ["eval", childCode],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const stdout = child.stdout
      .pipeThrough(new TextDecoderStream())
      .getReader();
    const stderrPromise = child.stderr
      .pipeThrough(new TextDecoderStream())
      .getReader()
      .read();

    try {
      const { value } = await stdout.read();
      assertEquals(value, "ready\n");

      child.kill("SIGTERM");
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const status = await Promise.race([
        child.status,
        new Promise<undefined>((resolve) => {
          timeoutId = setTimeout(() => resolve(undefined), 2000);
        }),
      ]);
      clearTimeout(timeoutId);

      if (status === undefined) {
        child.kill("SIGKILL");
        await child.status;
        const stderr = (await stderrPromise).value ?? "";
        throw new Error(`child ignored SIGTERM; stderr: ${stderr}`);
      }

      assertEquals(status.signal, "SIGTERM");
    } finally {
      stdout.releaseLock();
    }
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { run: true },
  },
  function windowsThrowsOnNegativeProcessIdTest() {
    assertThrows(
      () => {
        Oden.kill(-1, "SIGKILL");
      },
      TypeError,
      "Invalid pid",
    );
  },
);

Oden.test(
  {
    ignore: Oden.build.os !== "windows",
    permissions: { run: true },
  },
  function noOpenSystemIdleProcessTest() {
    let signal: Oden.Signal = "SIGKILL";

    assertThrows(
      () => {
        Oden.kill(0, signal);
      },
      TypeError,
      `Invalid pid`,
    );

    signal = "SIGTERM";
    assertThrows(
      () => {
        Oden.kill(0, signal);
      },
      TypeError,
      `Invalid pid`,
    );
  },
);

Oden.test(function signalInvalidHandlerTest() {
  assertThrows(() => {
    // deno-lint-ignore no-explicit-any
    Oden.addSignalListener("SIGINT", "handler" as any);
  });
  assertThrows(() => {
    // deno-lint-ignore no-explicit-any
    Oden.removeSignalListener("SIGINT", "handler" as any);
  });
});

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { run: true },
  },
  function signalForbiddenSignalTest() {
    assertThrows(
      () => Oden.addSignalListener("SIGKILL", () => {}),
      TypeError,
      "Binding to signal 'SIGKILL' is not allowed",
    );
    assertThrows(
      () => Oden.addSignalListener("SIGSTOP", () => {}),
      TypeError,
      "Binding to signal 'SIGSTOP' is not allowed",
    );
    assertThrows(
      () => Oden.addSignalListener("SIGILL", () => {}),
      TypeError,
      "Binding to signal 'SIGILL' is not allowed",
    );
    assertThrows(
      () => Oden.addSignalListener("SIGFPE", () => {}),
      TypeError,
      "Binding to signal 'SIGFPE' is not allowed",
    );
    assertThrows(
      () => Oden.addSignalListener("SIGSEGV", () => {}),
      TypeError,
      "Binding to signal 'SIGSEGV' is not allowed",
    );
  },
);

Oden.test(
  { ignore: Oden.build.os !== "linux" },
  function signalAliasLinux() {
    const i = () => {};
    Oden.addSignalListener("SIGUNUSED", i);
    Oden.addSignalListener("SIGPOLL", i);

    Oden.removeSignalListener("SIGUNUSED", i);
    Oden.removeSignalListener("SIGPOLL", i);
  },
);

Oden.test(
  {
    ignore: Oden.build.os === "windows",
    permissions: { run: true },
  },
  function killWithSignalZero() {
    // This should not throw for the current process
    Oden.kill(Oden.pid, 0);

    // Test with a non-existent PID (very high number unlikely to exist)
    assertThrows(
      () => {
        Oden.kill(999999, 0);
      },
      Oden.errors.NotFound,
    );
  },
);
