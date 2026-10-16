const binaryName = Oden.build.os === "windows" ? "binary.exe" : "binary";
Oden.copyFileSync(Oden.execPath(), binaryName);

console.log("Running...");
new Oden.Command(
  Oden.execPath(),
  {
    args: [
      "run",
      "--allow-write",
      "--allow-read",
      `--allow-run=binary`,
      "sub.ts",
    ],
    env: {
      PATH: Oden.cwd(),
    },
    stderr: "inherit",
    stdout: "inherit",
  },
).outputSync();
