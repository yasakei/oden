// Copyright 2018-2026 the Oden authors. MIT license.
import { assertEquals } from "./test_util.ts";

// Note tests for Oden.stdin.setRaw is in integration tests.

Oden.test(
  { permissions: { run: true, read: true } },
  async function noColorIfNotTty() {
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "console.log(1)"],
    }).output();
    const output = new TextDecoder().decode(stdout);
    assertEquals(output, "1\n");
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function odenNoColorIsNotAffectedByNonTty() {
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "console.log(Oden.noColor)"],
    }).output();
    const output = new TextDecoder().decode(stdout);
    assertEquals(output, "false\n");
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function odenNoColorTrueEmptyVar() {
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "console.log(Oden.noColor)"],
      env: {
        // https://no-color.org/ -- should not be true when empty
        NO_COLOR: "",
      },
    }).output();
    const output = new TextDecoder().decode(stdout);
    assertEquals(output, "false\n");
  },
);

Oden.test(
  { permissions: { run: true, read: true } },
  async function odenNoColorTrueEmptyVar() {
    const { stdout } = await new Oden.Command(Oden.execPath(), {
      args: ["eval", "console.log(Oden.noColor)"],
      env: {
        NO_COLOR: "1",
      },
    }).output();
    const output = new TextDecoder().decode(stdout);
    assertEquals(output, "true\n");
  },
);
