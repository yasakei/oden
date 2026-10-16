// `oden remove --global` is an alias for `oden uninstall --global`, so after
// it runs the globally installed executable should be gone from the bin dir.
const binsDir = "./bins/bin";
for await (const entry of Oden.readDir(binsDir)) {
  if (entry.name === "oden-test-bin" || entry.name === "oden-test-bin.cmd") {
    throw new Error(
      `Expected ${entry.name} to be removed by 'oden remove --global', but it still exists`,
    );
  }
}
