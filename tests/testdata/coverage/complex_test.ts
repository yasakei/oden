import { complex } from "./complex.ts";

Oden.test("complex", function () {
  complex("foo", "bar", "baz");
});

Oden.test("sub process with stdin", async () => {
  // ensure launching oden run with stdin doesn't affect coverage
  const code = "console.log('5')";
  const command = new Oden.Command(Oden.execPath(), {
    args: ["run", "-"],
    stdin: "piped",
    stdout: "piped",
  });
  await using child = command.spawn();
  await ReadableStream.from([code])
    .pipeThrough(new TextEncoderStream())
    .pipeTo(child.stdin);
  const { stdout } = await child.output();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== "5") {
    throw new Error("Failed");
  }
});

Oden.test("sub process with oden eval", () => {
  // ensure launching oden eval doesn't affect coverage
  const code = "console.log('5')";
  const { stdout } = new Oden.Command(Oden.execPath(), {
    args: ["eval", code],
  }).outputSync();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== "5") {
    throw new Error("Failed");
  }
});

Oden.test("ODEN_COVERAGE_DIR is set and passed down to child process", () => {
  const coverageDir = Oden.env.get("ODEN_COVERAGE_DIR");
  if (coverageDir === undefined) {
    throw new Error("ODEN_COVERAGE_DIR is not set");
  }
  const code = "console.log(Oden.env.get('ODEN_COVERAGE_DIR'))";
  const { stdout } = new Oden.Command(Oden.execPath(), {
    args: ["eval", code],
  }).outputSync();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== coverageDir) {
    throw new Error("Failed");
  }
});
