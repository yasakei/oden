const binaryName = Oden.build.os === "windows" ? "binary.exe" : "binary";
Oden.copyFileSync(Oden.execPath(), binaryName);

console.log("Running...");
const result = new Oden.Command(
  Oden.execPath(),
  {
    args: ["run", "--allow-write", `--allow-run=./${binaryName}`, "sub.ts"],
    stderr: "inherit",
    stdout: "inherit",
  },
).outputSync();

console.assert(result.code == 1, "Expected failure");
